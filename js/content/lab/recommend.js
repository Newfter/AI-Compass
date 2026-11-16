/* =========================================================
   AI COMPASS — TEXTS AND DATA: "WHY YOUR FEED LOOKS LIKE THAT" (js/lab/recommend.js)
   Keys: lab.recommend.*  The shared words (Play, Step, Reset...) are lab.kit.*
   in js/content/lab/kit.js. Plurals: "one|other" (English), "one|few|many"
   (Russian). The videos are at the end (lab.recommend data); the viewers
   are made by js/lab/recommend.js from a fixed seed.
   Its title, hook and big idea are in js/content/lab.js (section 3): the lab's picker shows
   them before this file is loaded.
   ========================================================= */

window.AICompass.addTranslations({
    en: {
        // ----- The two parts -----
        "lab.recommend.part": "Part",
        "lab.recommend.partLike": "People like you",
        "lab.recommend.partFeed": "The feed bubble",

        // ----- Part 1: people like you -----
        "lab.recommend.likeTitle": "Like the videos you would watch",
        "lab.recommend.likeHelp": "Tap a video to like it. The app compares your likes with 30 other viewers.",
        "lab.recommend.liked": "Liked",
        "lab.recommend.likeLabel": "{title}, {topic}",
        "lab.recommend.clearLikes": "Clear my likes",
        "lab.recommend.neighboursTitle": "Viewers most like you",
        "lab.recommend.neighboursEmpty": "Like at least one video to find viewers like you.",
        "lab.recommend.viewer": "Viewer {n}",
        "lab.recommend.match": "{n} match",
        "lab.recommend.alsoLiked": "Also liked: {list}",
        "lab.recommend.recsTitle": "Recommended for you",
        "lab.recommend.recsEmpty": "Nothing yet: like a video first.",
        "lab.recommend.because": "{n} similar viewer liked it|{n} similar viewers liked it",
        "lab.recommend.surprise": "new topic for you",
        "lab.recommend.score": "score {n}",

        // ----- Part 2: the feed -----
        "lab.recommend.feedTitle": "Round {n}: your feed",
        "lab.recommend.feedStart": "Press Play: each round the app shows 5 videos, you watch one, and the app learns from it.",
        "lab.recommend.explore": "Mix in surprises",
        "lab.recommend.exploreHint": "The share of feed places filled with a random topic instead of “more of what you watched”.",
        "lab.recommend.variety": "Variety of your feed",
        "lab.recommend.rounds": "Rounds",
        "lab.recommend.watched": "Watched",
        "lab.recommend.tasteTitle": "What you really like vs. what the feed shows",
        "lab.recommend.taste": "You really like",
        "lab.recommend.shown": "Feed shows (last 5 rounds)",
        "lab.recommend.chart": "The variety of the feed, round by round",
        "lab.recommend.chartVariety": "Variety",
        "lab.recommend.chartRound": "Round",
        "lab.recommend.newViewer": "New viewer",
        "lab.recommend.saidRound": "Round {n}: watched {title}. Variety {variety}.",
        "lab.recommend.saidDone": "Done after {n} rounds. Variety {variety}.",

        // ----- Topics -----
        "lab.recommend.topic.football": "Football",
        "lab.recommend.topic.cooking": "Cooking",
        "lab.recommend.topic.space": "Space",
        "lab.recommend.topic.music": "Music",
        "lab.recommend.topic.animals": "Animals",

        // ----- What's happening? -----
        "lab.recommend.step1": "Your likes are a list of yes/no answers, one per video. The app compares your list with every viewer's list: the more likes you share, the closer the match. You've liked <strong>{n}</strong>.",
        "lab.recommend.step2": "It picks the viewers who match you best and adds up what they liked that you haven't seen yet. Your best match: <strong>{best}</strong>.",
        "lab.recommend.step3": "In a feed this repeats every round: you can only watch what you're shown, and every watch makes the app show more of the same. Variety now: <strong>{variety}</strong>.",
        "lab.recommend.noteBubble": "Your feed has shrunk to almost one topic, though you really like all five. This loop is called a filter bubble. Nobody planned it: it comes from “show more of what got watched”.",
        "lab.recommend.noteLike": "Nobody told the app what the videos are about. It only knows who liked what. This is called collaborative filtering, and big video and shopping apps use ideas like it (with far more data, and many other signals).",
        "lab.recommend.describe": "Feed after {n} rounds. Variety {variety}. Surprises {explore}.",

        // ----- Try this -----
        "lab.recommend.ch1": "Like 3 videos or more and find a viewer who matches you at least 70%.",
        "lab.recommend.ch1Why": "People with similar tastes are good predictors of each other. That's the whole trick: the app doesn't need to understand football to know you'll like the next football video.",
        "lab.recommend.ch2": "Get a recommendation from a topic you haven't liked anything in yet.",
        "lab.recommend.ch2Why": "Viewers like you also like other things, so you get carried into new topics. This is how a recommendation can feel surprisingly good.",
        "lab.recommend.ch3": "The bubble: with no surprises, run the feed until its variety drops below 30%.",
        "lab.recommend.ch3Why": "Every watch makes the same topic more likely to be shown, and what's shown is all you can watch. The loop feeds itself.",
        "lab.recommend.ch4": "Pop it: with surprises at 30% or more, keep the variety above 50% after 40 rounds.",
        "lab.recommend.ch4Why": "A little randomness keeps the app learning what else you like. Real apps add “exploration” on purpose, and you can do it too: search, follow new things, and tap “Not interested”.",
        "lab.recommend.ideaLine": "An app's guess about what you will like next is called a",
        "lab.recommend.term": "recommendation system"
    },
    ru: {
        "lab.recommend.part": "Часть",
        "lab.recommend.partLike": "Люди как ты",
        "lab.recommend.partFeed": "Пузырь ленты",

        "lab.recommend.likeTitle": "Лайкни видео, которые ты бы посмотрел",
        "lab.recommend.likeHelp": "Нажми на видео, чтобы лайкнуть его. Приложение сравнит твои лайки с лайками 30 других зрителей.",
        "lab.recommend.liked": "Нравится",
        "lab.recommend.likeLabel": "{title}, {topic}",
        "lab.recommend.clearLikes": "Убрать мои лайки",
        "lab.recommend.neighboursTitle": "Самые похожие на тебя зрители",
        "lab.recommend.neighboursEmpty": "Лайкни хотя бы одно видео, чтобы найти похожих зрителей.",
        "lab.recommend.viewer": "Зритель {n}",
        "lab.recommend.match": "совпадение {n}",
        "lab.recommend.alsoLiked": "Ещё лайкнул: {list}",
        "lab.recommend.recsTitle": "Рекомендуем тебе",
        "lab.recommend.recsEmpty": "Пока ничего: сначала лайкни видео.",
        "lab.recommend.because": "Понравилось {n} похожему зрителю|Понравилось {n} похожим зрителям|Понравилось {n} похожим зрителям",
        "lab.recommend.surprise": "новая для тебя тема",
        "lab.recommend.score": "баллы {n}",

        "lab.recommend.feedTitle": "Раунд {n}: твоя лента",
        "lab.recommend.feedStart": "Нажми «Пуск»: каждый раунд приложение показывает 5 видео, ты смотришь одно, и приложение учится на этом.",
        "lab.recommend.explore": "Добавлять сюрпризы",
        "lab.recommend.exploreHint": "Доля мест в ленте, где показывается случайная тема вместо «ещё того, что ты смотрел».",
        "lab.recommend.variety": "Разнообразие ленты",
        "lab.recommend.rounds": "Раунды",
        "lab.recommend.watched": "Просмотрено",
        "lab.recommend.tasteTitle": "Что тебе на самом деле нравится и что показывает лента",
        "lab.recommend.taste": "Тебе на самом деле нравится",
        "lab.recommend.shown": "Лента показывает (последние 5 раундов)",
        "lab.recommend.chart": "Разнообразие ленты по раундам",
        "lab.recommend.chartVariety": "Разнообразие",
        "lab.recommend.chartRound": "Раунд",
        "lab.recommend.newViewer": "Новый зритель",
        "lab.recommend.saidRound": "Раунд {n}: просмотрено «{title}». Разнообразие {variety}.",
        "lab.recommend.saidDone": "Готово после раундов: {n}. Разнообразие {variety}.",

        "lab.recommend.topic.football": "Футбол",
        "lab.recommend.topic.cooking": "Кулинария",
        "lab.recommend.topic.space": "Космос",
        "lab.recommend.topic.music": "Музыка",
        "lab.recommend.topic.animals": "Животные",

        "lab.recommend.step1": "Твои лайки — это список ответов «да/нет», по одному на видео. Приложение сравнивает твой список со списком каждого зрителя: чем больше общих лайков, тем ближе совпадение. Ты лайкнул: <strong>{n}</strong>.",
        "lab.recommend.step2": "Оно берёт самых похожих зрителей и складывает, что им понравилось из того, что ты ещё не видел. Лучшее совпадение: <strong>{best}</strong>.",
        "lab.recommend.step3": "В ленте это повторяется каждый раунд: смотреть можно только то, что показали, и каждый просмотр заставляет приложение показывать ещё больше того же. Разнообразие сейчас: <strong>{variety}</strong>.",
        "lab.recommend.noteBubble": "Лента сжалась почти до одной темы, хотя тебе нравятся все пять. Такая петля называется пузырём фильтров. Никто её не планировал: она получается из правила «показывать больше того, что смотрели».",
        "lab.recommend.noteLike": "Никто не говорил приложению, о чём эти видео. Оно знает только, кому что понравилось. Это называется коллаборативной фильтрацией, и большие видео- и интернет-магазины используют похожие идеи (с гораздо большим количеством данных и других сигналов).",
        "lab.recommend.describe": "Лента после раундов: {n}. Разнообразие {variety}. Сюрпризы {explore}.",

        "lab.recommend.ch1": "Лайкни 3 видео или больше и найди зрителя, который совпадает с тобой хотя бы на 70%.",
        "lab.recommend.ch1Why": "Люди с похожими вкусами хорошо предсказывают друг друга. В этом весь трюк: приложению не нужно понимать футбол, чтобы знать, что тебе понравится следующее видео о футболе.",
        "lab.recommend.ch2": "Получи рекомендацию из темы, в которой ты ещё ничего не лайкал.",
        "lab.recommend.ch2Why": "Похожим на тебя зрителям нравится и другое, поэтому тебя приводят к новым темам. Вот почему рекомендация иногда кажется на удивление удачной.",
        "lab.recommend.ch3": "Пузырь: без сюрпризов запускай ленту, пока разнообразие не упадёт ниже 30%.",
        "lab.recommend.ch3Why": "Каждый просмотр делает ту же тему более вероятной для показа, а смотреть можно только то, что показали. Петля сама себя кормит.",
        "lab.recommend.ch4": "Лопни его: с сюрпризами от 30% удержи разнообразие выше 50% после 40 раундов.",
        "lab.recommend.ch4Why": "Немного случайности помогает приложению узнавать, что ещё тебе нравится. Настоящие приложения добавляют «исследование» специально, и ты тоже можешь: ищи, подписывайся на новое и нажимай «Не интересно».",
        "lab.recommend.ideaLine": "Догадка приложения о том, что тебе понравится дальше, называется",
        "lab.recommend.term": "рекомендательная система"
    }
});

// The videos: [id, topic, emoji]. Titles per language. Viewers are made in js/lab/recommend.js.
window.AICompass.content.set("lab.recommend", {
    topics: ["football", "cooking", "space", "music", "animals"],
    videos: [
        ["goals", "football", "⚽"], ["skills", "football", "🥅"], ["worldcup", "football", "🏆"],
        ["pancakes", "cooking", "🥞"], ["pizza", "cooking", "🍕"], ["noodles", "cooking", "🍜"],
        ["rocket", "space", "🚀"], ["moon", "space", "🌕"], ["blackhole", "space", "🕳️"],
        ["guitar", "music", "🎸"], ["drums", "music", "🥁"], ["concert", "music", "🎤"],
        ["pandas", "animals", "🐼"], ["octopus", "animals", "🐙"], ["puppies", "animals", "🐶"]
    ],
    titles: {
        en: {
            goals: "Top 10 goals of the year", skills: "Learn 3 football tricks", worldcup: "World Cup final, best bits",
            pancakes: "Fluffy pancakes in 5 minutes", pizza: "Homemade pizza", noodles: "Easy noodle soup",
            rocket: "A rocket launch up close", moon: "Why the Moon has phases", blackhole: "What is a black hole?",
            guitar: "First guitar chords", drums: "Drum solo challenge", concert: "Live concert from the front row",
            pandas: "Baby pandas playing", octopus: "The clever octopus", puppies: "Puppies meet snow"
        },
        ru: {
            goals: "10 лучших голов года", skills: "3 футбольных финта", worldcup: "Финал чемпионата мира: лучшее",
            pancakes: "Пышные блины за 5 минут", pizza: "Домашняя пицца", noodles: "Простой суп с лапшой",
            rocket: "Запуск ракеты вблизи", moon: "Почему у Луны есть фазы", blackhole: "Что такое чёрная дыра?",
            guitar: "Первые аккорды на гитаре", drums: "Челлендж: соло на барабанах", concert: "Концерт из первого ряда",
            pandas: "Малыши панды играют", octopus: "Умный осьминог", puppies: "Щенки впервые видят снег"
        }
    }
});
