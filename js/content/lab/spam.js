/* =========================================================
   AI COMPASS — TEXTS AND DATA: "BUILD A SPAM FILTER" (js/lab/spam.js)
   Keys: lab.spam.*  The shared words (Play, Step, Reset...) are lab.kit.*
   in js/content/lab/kit.js. Plurals: "one|other" (English), "one|few|many"
   (Russian). The messages are at the end (lab.spam data), one set per
   language, because the filter learns words.
   Its title, hook and big idea are in js/content/lab.js (section 3): the lab's picker shows
   them before this file is loaded.
   ========================================================= */

window.AICompass.addTranslations({
    en: {
        // ----- Write a message -----
        "lab.spam.writeTitle": "Write a message",
        "lab.spam.writeLabel": "Your message",
        "lab.spam.placeholder": "Type a message, like a text from a friend or an advert…",
        "lab.spam.example": "Show an example",
        "lab.spam.clear": "Clear",
        "lab.spam.chance": "Chance it's spam",
        "lab.spam.verdictSpam": "Goes to the spam folder",
        "lab.spam.verdictHam": "Goes to the inbox",
        "lab.spam.verdictEmpty": "Write something to test it",
        "lab.spam.wordsTitle": "What each word says",
        "lab.spam.wordsHelp": "Red words point to spam, blue words to a normal message. Grey words were never seen in training, so they say nothing.",
        "lab.spam.wordSpam": "{word}: looks like spam, ×{n}",
        "lab.spam.wordHam": "{word}: looks normal, ×{n}",
        "lab.spam.wordNew": "{word}: never seen",
        "lab.spam.wordsNone": "No words yet.",

        // ----- Teach it -----
        "lab.spam.teachTitle": "Teach the filter",
        "lab.spam.teachHelp": "Add your message to the training examples, with the right answer.",
        "lab.spam.markSpam": "This is spam",
        "lab.spam.markHam": "This is normal",
        "lab.spam.forget": "Forget my examples",
        "lab.spam.taught": "{n} example of yours|{n} examples of yours",
        "lab.spam.taughtNone": "No examples of yours yet.",
        "lab.spam.saidTaught": "Learned it as {label}. The filter has {n} training messages now.",
        "lab.spam.labelSpam": "spam",
        "lab.spam.labelHam": "normal",

        // ----- The threshold and the test -----
        "lab.spam.threshold": "Call it spam from",
        "lab.spam.thresholdHint": "A higher line lets more spam through. A lower line blocks more good messages by mistake.",
        "lab.spam.testTitle": "On {n} new messages",
        "lab.spam.caught": "Spam caught",
        "lab.spam.missed": "Spam missed",
        "lab.spam.blocked": "Good blocked",
        "lab.spam.passed": "Good delivered",
        "lab.spam.accuracy": "Right",
        "lab.spam.ofSpam": "of {n} spam",
        "lab.spam.ofHam": "of {n} good",
        "lab.spam.tableTitle": "The new messages, one by one ({n})",
        "lab.spam.colMessage": "Message",
        "lab.spam.colTruth": "Really",
        "lab.spam.colChance": "Chance",
        "lab.spam.colVerdict": "Filter",
        "lab.spam.spam": "Spam",
        "lab.spam.ham": "Normal",
        "lab.spam.right": "right",
        "lab.spam.wrong": "wrong",

        // ----- Clues -----
        "lab.spam.cluesTitle": "Strongest clues it learned",
        "lab.spam.cluesSpam": "Spam words",
        "lab.spam.cluesHam": "Normal words",

        // ----- What's happening? -----
        "lab.spam.step1": "The filter read <strong>{spam}</strong> spam and <strong>{ham}</strong> normal messages and counted how often each word appears in each pile.",
        "lab.spam.step2": "For every word in your message it asks: is this word more common in spam or in normal messages? Each answer multiplies the odds. Your message has <strong>{known}</strong> known words.",
        "lab.spam.step3": "All the clues together give the chance: <strong>{chance}</strong>. From <strong>{line}</strong> it goes to the spam folder.",
        "lab.spam.noteNaive": "It's called “naive” because it treats every word as a separate clue and ignores word order: “not free” and “free, not” look the same to it. Even so, filters like this sorted most of the world's email for years.",
        "lab.spam.noteLine": "No line is perfect: catching every spam means blocking some good messages too. Real email services set the line high, because losing a real message is worse than seeing an advert.",
        "lab.spam.describe": "Chance the message is spam: {chance}. On the new messages: {caught} spam caught, {blocked} good messages blocked.",

        // ----- Try this -----
        "lab.spam.ch1": "Write a message the filter is at least 90% sure is spam.",
        "lab.spam.ch1Why": "Spam piles up clue after clue: every “free”, “win” and “click” multiplies the odds. That's why adverts full of these words are easy to catch.",
        "lab.spam.ch2": "Sneak past: write a message with the word “free” that still goes to the inbox.",
        "lab.spam.ch2Why": "One spammy word isn't enough: normal words around it pull the odds back. Spammers use this trick too, by adding friendly words to their adverts.",
        "lab.spam.ch3": "Move the line so that no good message is blocked, but at least 6 spam messages are still caught.",
        "lab.spam.ch3Why": "Picking the line is a choice about which mistake hurts more. Real filters prefer to miss some spam rather than hide a message from your teacher.",
        "lab.spam.ch4": "Teach the filter 2 messages of your own and watch the chance change.",
        "lab.spam.ch4Why": "Clicking “Report spam” in your email does exactly this: it adds training examples, and the filter's word counts shift for everyone.",
        "lab.spam.ideaLine": "This way of adding up word clues is called a",
        "lab.spam.term": "naive Bayes classifier"
    },
    ru: {
        "lab.spam.writeTitle": "Напиши сообщение",
        "lab.spam.writeLabel": "Твоё сообщение",
        "lab.spam.placeholder": "Напиши сообщение, например как от друга или как рекламу…",
        "lab.spam.example": "Показать пример",
        "lab.spam.clear": "Очистить",
        "lab.spam.chance": "Шанс, что это спам",
        "lab.spam.verdictSpam": "Попадёт в папку «Спам»",
        "lab.spam.verdictHam": "Попадёт во входящие",
        "lab.spam.verdictEmpty": "Напиши что-нибудь, чтобы проверить",
        "lab.spam.wordsTitle": "Что говорит каждое слово",
        "lab.spam.wordsHelp": "Красные слова говорят «спам», синие — «обычное сообщение». Серые слова не встречались при обучении, поэтому ничего не говорят.",
        "lab.spam.wordSpam": "{word}: похоже на спам, ×{n}",
        "lab.spam.wordHam": "{word}: похоже на обычное, ×{n}",
        "lab.spam.wordNew": "{word}: не встречалось",
        "lab.spam.wordsNone": "Слов пока нет.",

        "lab.spam.teachTitle": "Научи фильтр",
        "lab.spam.teachHelp": "Добавь своё сообщение к обучающим примерам с правильным ответом.",
        "lab.spam.markSpam": "Это спам",
        "lab.spam.markHam": "Это обычное",
        "lab.spam.forget": "Забыть мои примеры",
        "lab.spam.taught": "{n} твой пример|{n} твоих примера|{n} твоих примеров",
        "lab.spam.taughtNone": "Твоих примеров пока нет.",
        "lab.spam.saidTaught": "Запомнил как {label}. Теперь у фильтра обучающих сообщений: {n}.",
        "lab.spam.labelSpam": "спам",
        "lab.spam.labelHam": "обычное",

        "lab.spam.threshold": "Считать спамом от",
        "lab.spam.thresholdHint": "Чем выше черта, тем больше спама проходит. Чем ниже, тем больше хороших сообщений блокируется по ошибке.",
        "lab.spam.testTitle": "На {n} новых сообщениях",
        "lab.spam.caught": "Спам пойман",
        "lab.spam.missed": "Спам пропущен",
        "lab.spam.blocked": "Хорошие заблокированы",
        "lab.spam.passed": "Хорошие доставлены",
        "lab.spam.accuracy": "Верно",
        "lab.spam.ofSpam": "из {n} спама",
        "lab.spam.ofHam": "из {n} хороших",
        "lab.spam.tableTitle": "Новые сообщения по одному ({n})",
        "lab.spam.colMessage": "Сообщение",
        "lab.spam.colTruth": "На самом деле",
        "lab.spam.colChance": "Шанс",
        "lab.spam.colVerdict": "Фильтр",
        "lab.spam.spam": "Спам",
        "lab.spam.ham": "Обычное",
        "lab.spam.right": "верно",
        "lab.spam.wrong": "неверно",

        "lab.spam.cluesTitle": "Самые сильные подсказки, которые он выучил",
        "lab.spam.cluesSpam": "Слова спама",
        "lab.spam.cluesHam": "Обычные слова",

        "lab.spam.step1": "Фильтр прочитал <strong>{spam}</strong> спам-сообщений и <strong>{ham}</strong> обычных и посчитал, как часто каждое слово встречается в каждой куче.",
        "lab.spam.step2": "Для каждого слова твоего сообщения он спрашивает: где это слово чаще — в спаме или в обычных сообщениях? Каждый ответ умножает шансы. Знакомых слов в твоём сообщении: <strong>{known}</strong>.",
        "lab.spam.step3": "Все подсказки вместе дают шанс: <strong>{chance}</strong>. От <strong>{line}</strong> сообщение уходит в спам.",
        "lab.spam.noteNaive": "Его называют «наивным», потому что он считает каждое слово отдельной подсказкой и не смотрит на порядок слов: «не бесплатно» и «бесплатно, не» для него одинаковы. И всё же такие фильтры много лет сортировали большую часть почты в мире.",
        "lab.spam.noteLine": "Идеальной черты нет: поймать весь спам — значит заблокировать и часть хороших сообщений. Настоящие почтовые сервисы ставят черту высоко: потерять настоящее письмо хуже, чем увидеть рекламу.",
        "lab.spam.describe": "Шанс, что сообщение — спам: {chance}. На новых сообщениях: спама поймано {caught}, хороших заблокировано {blocked}.",

        "lab.spam.ch1": "Напиши сообщение, в котором фильтр хотя бы на 90% уверен, что это спам.",
        "lab.spam.ch1Why": "Спам складывается из подсказки за подсказкой: каждое «бесплатно», «выиграй» и «жми» умножает шансы. Поэтому рекламу, полную таких слов, легко поймать.",
        "lab.spam.ch2": "Проскользни: напиши сообщение со словом «бесплатно», которое всё равно попадёт во входящие.",
        "lab.spam.ch2Why": "Одного спамного слова мало: обычные слова вокруг тянут шансы обратно. Спамеры тоже пользуются этим трюком и добавляют в рекламу дружелюбные слова.",
        "lab.spam.ch3": "Сдвинь черту так, чтобы ни одно хорошее сообщение не блокировалось, но спама ловилось хотя бы 6.",
        "lab.spam.ch3Why": "Выбор черты — это выбор, какая ошибка обиднее. Настоящие фильтры лучше пропустят немного спама, чем спрячут письмо от учителя.",
        "lab.spam.ch4": "Научи фильтр двум своим сообщениям и посмотри, как изменится шанс.",
        "lab.spam.ch4Why": "Кнопка «Это спам» в почте делает ровно это: добавляет обучающие примеры, и счёт слов у фильтра меняется для всех.",
        "lab.spam.ideaLine": "Такой способ складывать подсказки-слова называется",
        "lab.spam.term": "наивный байесовский классификатор"
    }
});

// The messages: [text, 1 = spam / 0 = normal]. The filter trains on "train" and is
// tested on "test", which it never learns from. "free" is the word of challenge 2.
window.AICompass.content.set("lab.spam", {
    en: {
        free: "free",
        train: [
            ["Congratulations you won a free phone click the link now to claim your prize", 1],
            ["Win cash now limited offer click here", 1],
            ["Urgent your account is locked click the link to confirm your password", 1],
            ["Free gift card for you claim it today before the offer ends", 1],
            ["You are our lucky winner claim your cash prize now", 1],
            ["Cheap phones and free delivery only today click now", 1],
            ["Earn money fast from home no experience needed click here", 1],
            ["Your prize is waiting confirm your account details now", 1],
            ["Limited offer win a free trip click the link", 1],
            ["Final notice your account will be closed send your password now", 1],
            ["Hot deal cheap game coins free bonus click now", 1],
            ["You have been selected for a cash reward claim now", 1],
            ["Are we still meeting after school tomorrow", 0],
            ["Mum says dinner is at seven see you at home", 0],
            ["Did you finish the maths homework for tomorrow", 0],
            ["Thanks for lunch today see you in class", 0],
            ["The football game starts at four can you come", 0],
            ["Can you send me the photos from the school trip", 0],
            ["I left my book in class can you bring it tomorrow", 0],
            ["Happy birthday hope you have a great day", 0],
            ["Practice is moved to Friday after school", 0],
            ["Do you want to play the new game tonight", 0],
            ["My mum can drive us home after the game", 0],
            ["The teacher said the project is due next week", 0]
        ],
        test: [
            ["Click now to win a free prize today", 1],
            ["Your account needs your password confirm now", 1],
            ["Cheap offer limited time claim your gift", 1],
            ["You won cash click the link to claim", 1],
            ["Free money for students click here now", 1],
            ["Winner selected claim your reward today", 1],
            ["Urgent send your details to keep your account", 1],
            ["Free tickets for the school game tomorrow my mum got extra", 0],
            ["See you after school at the game", 0],
            ["Can you help me with the homework tonight", 0],
            ["Click the link I sent for the class project now", 0],
            ["Thanks for the birthday gift it was great", 0],
            ["Dinner is ready come home now", 0],
            ["The trip is on Friday bring lunch", 0],
            ["Hot day today want to go swimming after class", 0],
            ["Did you win the game today", 0],
            ["Hi friend thanks for the game see my new shop for sneakers", 1]
        ]
    },
    ru: {
        free: "бесплатно",
        train: [
            ["Поздравляем ты выиграл телефон бесплатно жми на ссылку сейчас чтобы забрать приз", 1],
            ["Выиграй деньги сейчас предложение ограничено жми здесь", 1],
            ["Срочно твой аккаунт заблокирован жми на ссылку и подтверди пароль", 1],
            ["Подарочная карта бесплатно забери её сегодня пока действует предложение", 1],
            ["Ты наш счастливый победитель забери денежный приз сейчас", 1],
            ["Дешёвые телефоны и доставка бесплатно только сегодня жми сейчас", 1],
            ["Заработай деньги быстро из дома без опыта жми здесь", 1],
            ["Твой приз ждёт подтверди данные аккаунта сейчас", 1],
            ["Предложение ограничено выиграй поездку бесплатно жми на ссылку", 1],
            ["Последнее предупреждение аккаунт закроют пришли пароль сейчас", 1],
            ["Горячая скидка дешёвые монеты для игры бонус бесплатно жми сейчас", 1],
            ["Ты выбран для денежной награды забери сейчас", 1],
            ["Мы всё ещё встречаемся завтра после школы", 0],
            ["Мама говорит ужин в семь увидимся дома", 0],
            ["Ты сделал домашку по математике на завтра", 0],
            ["Спасибо за обед увидимся на уроке", 0],
            ["Футбольная игра в четыре ты придёшь", 0],
            ["Пришли мне фото со школьной поездки", 0],
            ["Я забыл книгу в классе принеси её завтра", 0],
            ["С днём рождения желаю отличного дня", 0],
            ["Тренировку перенесли на пятницу после школы", 0],
            ["Хочешь поиграть в новую игру вечером", 0],
            ["Моя мама отвезёт нас домой после игры", 0],
            ["Учитель сказал что проект нужно сдать на следующей неделе", 0]
        ],
        test: [
            ["Жми сейчас и выиграй приз бесплатно сегодня", 1],
            ["Твоему аккаунту нужен пароль подтверди сейчас", 1],
            ["Дешёвое предложение ограничено забери подарок", 1],
            ["Ты выиграл деньги жми на ссылку чтобы забрать", 1],
            ["Деньги бесплатно для школьников жми здесь сейчас", 1],
            ["Победитель выбран забери награду сегодня", 1],
            ["Срочно пришли данные чтобы сохранить аккаунт", 1],
            ["Билеты на школьную игру завтра бесплатно мама достала лишние", 0],
            ["Увидимся после школы на игре", 0],
            ["Поможешь мне с домашкой вечером", 0],
            ["Открой ссылку которую я прислал для проекта по классу", 0],
            ["Спасибо за подарок на день рождения он отличный", 0],
            ["Ужин готов иди домой сейчас", 0],
            ["Поездка в пятницу возьми обед", 0],
            ["Горячий день сегодня пойдём купаться после урока", 0],
            ["Ты выиграл игру сегодня", 0],
            ["Привет друг спасибо за игру загляни в мой новый магазин кроссовок", 1]
        ]
    }
});
