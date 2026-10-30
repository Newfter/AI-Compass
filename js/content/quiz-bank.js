/* =========================================================
   AI COMPASS — TEXTS: THE QUIZ'S QUESTION BANK
   Every question and every "Myth or fact" statement of the quiz,
   in English and in Russian (informal "ты"), one block per lesson.
   This is the second content file of the quiz: js/content/quiz.js
   (loaded with the page) has the quiz's buttons and messages and
   the list of questions with their tags (lesson, topic, difficulty,
   type). This file is big, so js/quiz.js loads it only when the quiz
   is needed: when it comes on screen, or when a game starts.

   A multiple-choice question has five texts:
       "quiz.q7.text"     the question
       "quiz.q7.o1"       the RIGHT answer (always the first one:
       "quiz.q7.o2" …     the answers are shuffled in every game)
       "quiz.q7.explain"  why the right answer is right, and why the
                          tempting wrong one is wrong
   A true-or-false question has only the text and the explanation,
   which starts with "True." or "False." ("Верно." / "Неверно.").
   A "Myth or fact" statement ("quiz.m1") has a text and a one-sentence
   explanation; whether it is a myth or a fact is in js/content/quiz.js.

   To add a question: write its texts here (in both languages), then
   add it to the list in js/content/quiz.js. To change one, change it
   here in both languages.
   ========================================================= */

// ----- Lesson 1: What is AI? -----
window.AICompass.addTranslations({
    en: {
        "quiz.q1.text": "What does “Artificial Intelligence” (AI) mean?",
        "quiz.q1.o1": "Computer systems that do tasks which usually need human intelligence",
        "quiz.q1.o2": "Any program that runs by itself, without a person controlling it all the time",
        "quiz.q1.o3": "Robots with real feelings that think exactly the way people do",
        "quiz.q1.o4": "Machines that know every fact and never make mistakes",
        "quiz.q1.explain": "AI means computer systems that do tasks we usually connect with human intelligence: understanding speech, recognising faces, translating text. Not every automatic program is AI: a timer that switches on the lights just follows fixed steps. And today's AI has no feelings, and it can definitely make mistakes.",

        "quiz.q13.text": "A chess program can beat any human champion, but it can't recognise a cat in a photo. What kind of AI is it?",
        "quiz.q13.o1": "Narrow AI: it is built for one kind of task",
        "quiz.q13.o2": "General AI: it can learn any task a human can",
        "quiz.q13.o3": "Broken AI: a working AI would do both",
        "quiz.q13.o4": "Not AI at all, because it can't see pictures",
        "quiz.q13.explain": "Today's AI is narrow: each system is built for a certain kind of task, so being brilliant at chess says nothing about photos. Nothing is broken, and it's still AI. A general AI (AGI) would be able to learn any intellectual task a human can, and a chess program is nowhere near that.",

        "quiz.q14.text": "A weather app shows a snowflake whenever the temperature is below 0 °C, because a programmer wrote that rule. Is this machine learning?",
        "quiz.q14.o1": "No: a person wrote the rule, nothing was learned from examples",
        "quiz.q14.o2": "Yes: every app that makes a decision uses machine learning",
        "quiz.q14.o3": "Yes: it reacts to the weather, so it must be learning",
        "quiz.q14.o4": "No: machine learning only works with pictures, not numbers",
        "quiz.q14.explain": "This is a classic program: it follows a rule that a programmer wrote by hand. Machine learning works the other way round: the computer finds its own rules in many examples. Reacting to data isn't the same as learning from it. And machine learning works with numbers, text and sound as well as pictures.",

        "quiz.q15.text": "How does a modern spam filter learn to catch new tricks that scammers invent?",
        "quiz.q15.o1": "From millions of emails that people marked as spam",
        "quiz.q15.o2": "A programmer writes a new rule for every new trick",
        "quiz.q15.o3": "It blocks every email that comes from a new sender",
        "quiz.q15.o4": "It reads each email and asks the sender if it's spam",
        "quiz.q15.explain": "Nobody can list every scammer's trick by hand. The filter learns patterns from huge numbers of emails that people marked as spam or not spam, so it can also catch tricks it has never seen. Blocking every new sender would block your new friends too, and a scammer would simply answer “not spam”.",

        "quiz.q16.text": "The term “artificial intelligence” is older than the Internet.",
        "quiz.q16.explain": "True. John McCarthy came up with the term in 1955, for a summer workshop at Dartmouth College held in 1956. ARPANET, the network that grew into the Internet, sent its first message only in 1969."
    },
    ru: {
        "quiz.q1.text": "Что означает «искусственный интеллект» (ИИ)?",
        "quiz.q1.o1": "Компьютерные системы для задач, которые обычно требуют человеческого ума",
        "quiz.q1.o2": "Любая программа, которая работает сама, без постоянного управления человеком",
        "quiz.q1.o3": "Роботы с настоящими чувствами, которые думают точно так же, как люди",
        "quiz.q1.o4": "Машины, которые знают все факты и никогда не ошибаются",
        "quiz.q1.explain": "ИИ — это компьютерные системы, которые решают задачи, обычно связанные с человеческим интеллектом: понимают речь, узнают лица, переводят тексты. Не каждая автоматическая программа — это ИИ: таймер, который включает свет, просто выполняет заданные шаги. А ещё у современного ИИ нет чувств, и он вполне может ошибаться.",

        "quiz.q13.text": "Шахматная программа может обыграть любого чемпиона, но не узнает кошку на фото. Что это за ИИ?",
        "quiz.q13.o1": "Узкий ИИ: он создан для задач одного вида",
        "quiz.q13.o2": "Общий ИИ: он может научиться всему, что умеет человек",
        "quiz.q13.o3": "Сломанный ИИ: исправный умел бы и то и другое",
        "quiz.q13.o4": "Вовсе не ИИ, ведь он не умеет смотреть на картинки",
        "quiz.q13.explain": "Современный ИИ — узкий: каждая система создана для задач определённого вида, поэтому блестящая игра в шахматы ничего не говорит о фотографиях. Ничего не сломано, и это всё равно ИИ. Общий ИИ (AGI) мог бы научиться любой интеллектуальной задаче, которая под силу человеку, — а шахматной программе до этого очень далеко.",

        "quiz.q14.text": "Приложение погоды показывает снежинку, когда температура ниже 0 °C, потому что так написал программист. Это машинное обучение?",
        "quiz.q14.o1": "Нет: правило написал человек, никто не учился на примерах",
        "quiz.q14.o2": "Да: любое приложение, которое что-то решает, — это машинное обучение",
        "quiz.q14.o3": "Да: раз оно реагирует на погоду, значит, оно учится",
        "quiz.q14.o4": "Нет: машинное обучение работает только с картинками, а не с числами",
        "quiz.q14.explain": "Это классическая программа: она выполняет правило, которое программист написал вручную. Машинное обучение устроено наоборот: компьютер сам находит правила во множестве примеров. Реагировать на данные — ещё не значит учиться на них. А машинное обучение работает и с числами, и с текстом, и со звуком, а не только с картинками.",

        "quiz.q15.text": "Как современный спам-фильтр учится ловить новые уловки мошенников?",
        "quiz.q15.o1": "На миллионах писем, которые люди отметили как спам",
        "quiz.q15.o2": "Программист пишет новое правило для каждой уловки",
        "quiz.q15.o3": "Он блокирует все письма от новых отправителей",
        "quiz.q15.o4": "Он читает письмо и спрашивает отправителя, спам ли это",
        "quiz.q15.explain": "Никто не может вручную перечислить все уловки мошенников. Фильтр находит закономерности в огромном количестве писем, которые люди отметили как спам или не спам, поэтому ловит даже уловки, которых раньше не видел. Блокировать всех новых отправителей — значит заблокировать и новых друзей, а мошенник на вопрос просто ответит «не спам».",

        "quiz.q16.text": "Термин «искусственный интеллект» старше интернета.",
        "quiz.q16.explain": "Верно. Джон Маккарти придумал этот термин в 1955 году для летнего семинара в Дартмутском колледже, который прошёл в 1956-м. А сеть ARPANET, из которой вырос интернет, передала первое сообщение только в 1969 году."
    }
});

// ----- Lesson 2: Machine Learning -----
window.AICompass.addTranslations({
    en: {
        "quiz.q2.text": "How is machine learning different from ordinary programming?",
        "quiz.q2.o1": "The computer learns patterns from examples, not just rules a person wrote",
        "quiz.q2.o2": "It's the same thing, just written in a newer and faster programming language",
        "quiz.q2.o3": "It only works on huge supercomputers, never on phones or laptops",
        "quiz.q2.o4": "The computer saves every example and later just looks up an exact match",
        "quiz.q2.explain": "In machine learning, we give the computer lots of examples (say, thousands of photos labelled “cat” or “dog”) and it works out the patterns itself, so it can handle new photos too. In ordinary programming, a person writes every rule. Machine learning runs on phones as well, for example in face unlock.",

        "quiz.q3.text": "If an AI learns from messy or wrong data, it will still give perfect answers.",
        "quiz.q3.explain": "False. There's a famous saying: “garbage in, garbage out”. An AI can only be as good as the data it learns from. Wrong, messy or one-sided data leads to wrong or unfair results.",

        "quiz.q17.text": "A model gets almost every training example right, but fails badly on new photos it has never seen. What is this called?",
        "quiz.q17.o1": "Overfitting: it memorised examples, not the pattern",
        "quiz.q17.o2": "Underfitting: it learned too little from the examples",
        "quiz.q17.o3": "Testing: it is being checked on photos it hasn't seen",
        "quiz.q17.o4": "Bias: it treats some groups of people unfairly",
        "quiz.q17.explain": "This is overfitting, like learning test answers by heart without understanding the topic. Underfitting is the opposite problem: a model too simple to do well even on its training examples. Testing on new data is how we notice overfitting, not what causes it.",

        "quiz.q18.text": "A music app sorts thousands of songs into groups that sound alike, without anyone labelling a single song. Which kind of learning is this?",
        "quiz.q18.o1": "Unsupervised learning",
        "quiz.q18.o2": "Supervised learning",
        "quiz.q18.o3": "Reinforcement learning",
        "quiz.q18.o4": "Rule-based programming",
        "quiz.q18.explain": "With no labels, the model has to find the groups by itself: that's unsupervised learning. Supervised learning needs the right answer (a label) for every example, and reinforcement learning learns from rewards for its actions.",

        "quiz.q19.text": "Every wolf photo a model learned from had snow in the background. Now it calls a husky standing in snow a wolf. Why?",
        "quiz.q19.o1": "It learned that snow means “wolf”, not what a wolf looks like",
        "quiz.q19.o2": "Its camera can't see colours, so it mixes up all dogs",
        "quiz.q19.o3": "It saw too many wolf photos, so it always answers “wolf”",
        "quiz.q19.o4": "Snow hides the details, so no model could tell them apart",
        "quiz.q19.explain": "The model found the easiest pattern in its training photos: snow. Nobody told it that the background doesn't matter. One-sided data teaches the wrong lesson, and photos of wolves on grass and huskies in snow would fix it. With better data, a model can tell the two apart, snow or no snow."
    },
    ru: {
        "quiz.q2.text": "Чем машинное обучение отличается от обычного программирования?",
        "quiz.q2.o1": "Компьютер сам ищет закономерности в примерах, а не только выполняет правила",
        "quiz.q2.o2": "Это то же самое программирование, только на новом и более быстром языке",
        "quiz.q2.o3": "Оно работает только на огромных суперкомпьютерах, но не на телефонах",
        "quiz.q2.o4": "Компьютер запоминает все примеры подряд, а потом просто ищет точное совпадение",
        "quiz.q2.explain": "В машинном обучении компьютеру дают много примеров (скажем, тысячи фото с подписями «кошка» или «собака»), и он сам находит закономерности, поэтому справляется и с новыми фото. В обычном программировании каждое правило пишет человек. Машинное обучение есть и в телефонах — например, в разблокировке по лицу.",

        "quiz.q3.text": "Если ИИ учится на неаккуратных или ошибочных данных, он всё равно будет отвечать идеально.",
        "quiz.q3.explain": "Неверно. Есть известное выражение: «мусор на входе — мусор на выходе». ИИ хорош ровно настолько, насколько хороши данные, на которых он учился. Ошибочные, неаккуратные или однобокие данные приводят к неверным или несправедливым результатам.",

        "quiz.q17.text": "Модель отвечает верно почти на все обучающие примеры, но сильно ошибается на новых фото, которых не видела. Как это называется?",
        "quiz.q17.o1": "Переобучение: она запомнила примеры, а не закономерность",
        "quiz.q17.o2": "Недообучение: она слишком мало узнала из примеров",
        "quiz.q17.o3": "Тестирование: её проверяют на незнакомых фото",
        "quiz.q17.o4": "Предвзятость: она несправедлива к некоторым группам людей",
        "quiz.q17.explain": "Это переобучение — как выучить ответы к контрольной наизусть, не понимая темы. Недообучение — противоположная проблема: модель слишком простая и плохо справляется даже с обучающими примерами. А тестирование на новых данных помогает переобучение заметить, но не вызывает его.",

        "quiz.q18.text": "Музыкальное приложение раскладывает тысячи песен на группы похожих по звучанию, хотя никто не подписал ни одной песни. Какой это вид обучения?",
        "quiz.q18.o1": "Обучение без учителя",
        "quiz.q18.o2": "Обучение с учителем",
        "quiz.q18.o3": "Обучение с подкреплением",
        "quiz.q18.o4": "Программирование по правилам",
        "quiz.q18.explain": "Подписей нет, поэтому модель сама ищет группы — это обучение без учителя. Обучению с учителем нужен правильный ответ (метка) для каждого примера, а обучение с подкреплением учится на наградах за свои действия.",

        "quiz.q19.text": "На всех фото волков, на которых училась модель, был снег. Теперь она называет волком хаски на снегу. Почему?",
        "quiz.q19.o1": "Она решила, что снег означает «волк», а не что волк так выглядит",
        "quiz.q19.o2": "Её камера не различает цвета, поэтому путает всех собак",
        "quiz.q19.o3": "Фото волков было слишком много, и она всегда отвечает «волк»",
        "quiz.q19.o4": "Снег скрывает детали, и никакая модель их не различит",
        "quiz.q19.explain": "Модель нашла в обучающих фото самую простую закономерность — снег. Никто не сказал ей, что фон не важен. Однобокие данные учат неправильному, а фото волков на траве и хаски на снегу всё бы исправили. С хорошими данными модель отличит одного от другого — хоть на снегу, хоть без него."
    }
});

// ----- Lesson 3: Neural Networks -----
window.AICompass.addTranslations({
    en: {
        "quiz.q4.text": "Artificial neural networks are exact digital copies of the human brain.",
        "quiz.q4.explain": "False. Neural networks were inspired by the way neurons in the brain pass signals to each other, but they are much simpler. They are layers of small maths units that adjust their connections while learning from data.",

        "quiz.q20.text": "What does the “deep” in “deep learning” mean?",
        "quiz.q20.o1": "The neural network has many layers, one after another",
        "quiz.q20.o2": "The AI thinks about each question for a long time",
        "quiz.q20.o3": "The model was trained on data from the deep web",
        "quiz.q20.o4": "The network understands the deeper meaning of text",
        "quiz.q20.explain": "A deep neural network has many layers between the input and the output, and training such networks is called deep learning. “Deep” describes the shape of the network, not deep thoughts or deep understanding.",

        "quiz.q21.text": "In a network that recognises photos, what do the first layers usually detect?",
        "quiz.q21.o1": "Simple things, like edges and spots of colour",
        "quiz.q21.o2": "Whole objects, like faces, cats and cars",
        "quiz.q21.o3": "The name of the person who took the photo",
        "quiz.q21.o4": "The photo's file name and the date it was taken",
        "quiz.q21.explain": "The first layers find simple patterns such as edges. The middle layers combine them into shapes and parts, and the last layers recognise whole objects. Spotting a whole cat in one step would be far too hard for a single layer.",

        "quiz.q22.text": "Before training, a neural network's weights are random numbers, so its first answers are nonsense.",
        "quiz.q22.explain": "True. Training starts from random weights. Every time the network gets something wrong, its weights are nudged a little, and after millions of nudges they hold everything it has learned.",

        "quiz.q23.text": "During training, what does backpropagation do?",
        "quiz.q23.o1": "Works out how to nudge each weight to make the error smaller",
        "quiz.q23.o2": "Sends the network's answers back to the people who asked",
        "quiz.q23.o3": "Deletes the neurons that gave a wrong answer",
        "quiz.q23.o4": "Copies the weights from a network that's already trained",
        "quiz.q23.explain": "After each answer the network measures its error. Backpropagation goes back through the layers and works out how much each weight added to that error, so every weight can be nudged the right way. Nothing is deleted or copied: the same weights just get a little better each time."
    },
    ru: {
        "quiz.q4.text": "Искусственные нейронные сети — это точные цифровые копии человеческого мозга.",
        "quiz.q4.explain": "Неверно. Нейросети придумали, вдохновившись тем, как нейроны мозга передают друг другу сигналы, но устроены они гораздо проще. Это слои маленьких математических блоков, которые подстраивают связи между собой, обучаясь на данных.",

        "quiz.q20.text": "Что означает слово «глубокое» в выражении «глубокое обучение»?",
        "quiz.q20.o1": "У нейросети много слоёв, один за другим",
        "quiz.q20.o2": "ИИ долго размышляет над каждым вопросом",
        "quiz.q20.o3": "Модель обучали на данных из «глубокого интернета»",
        "quiz.q20.o4": "Сеть понимает глубокий смысл любого текста",
        "quiz.q20.explain": "У глубокой нейросети много слоёв между входом и выходом, а обучение таких сетей называют глубоким обучением. «Глубокое» говорит о строении сети, а не о глубоких мыслях или глубоком понимании.",

        "quiz.q21.text": "Что обычно находят первые слои нейросети, которая распознаёт фото?",
        "quiz.q21.o1": "Простые вещи — края и цветные пятна",
        "quiz.q21.o2": "Целые объекты — лица, кошек и машины",
        "quiz.q21.o3": "Имя человека, который сделал снимок",
        "quiz.q21.o4": "Название файла и дату, когда снято фото",
        "quiz.q21.explain": "Первые слои находят простые закономерности, например края. Средние слои собирают из них формы и части, а последние узнают целые объекты. Распознать кошку целиком за один шаг одному слою было бы слишком сложно.",

        "quiz.q22.text": "До обучения веса нейросети — случайные числа, поэтому сначала она отвечает чепуху.",
        "quiz.q22.explain": "Верно. Обучение начинается со случайных весов. Каждый раз, когда сеть ошибается, веса чуть-чуть подправляют, и после миллионов таких поправок в них хранится всё, чему она научилась.",

        "quiz.q23.text": "Что делает обратное распространение ошибки во время обучения?",
        "quiz.q23.o1": "Вычисляет, как подправить каждый вес, чтобы ошибка стала меньше",
        "quiz.q23.o2": "Отправляет ответы сети обратно людям, которые спрашивали",
        "quiz.q23.o3": "Удаляет нейроны, которые дали неверный ответ",
        "quiz.q23.o4": "Копирует веса из сети, которая уже обучена",
        "quiz.q23.explain": "После каждого ответа сеть измеряет свою ошибку. Обратное распространение проходит по слоям назад и вычисляет, какой вклад в эту ошибку внёс каждый вес, — так каждый вес можно подправить в нужную сторону. Ничего не удаляется и не копируется: те же самые веса просто становятся чуть лучше."
    }
});

// ----- Lesson 4: Generative AI & Chatbots -----
window.AICompass.addTranslations({
    en: {
        "quiz.q5.text": "How does a chatbot like ChatGPT write its answers?",
        "quiz.q5.o1": "It predicts a likely next word again and again, using patterns learned from text",
        "quiz.q5.o2": "It searches the internet and pastes in the web page that matches your question best",
        "quiz.q5.o3": "It picks a ready-made answer from a giant database of questions",
        "quiz.q5.o4": "A team of people quickly types each answer behind the scenes",
        "quiz.q5.explain": "Chatbots run on large language models. They build an answer one small piece of text (a “token”) at a time, each time predicting what is likely to come next. That's why they sound so fluent, but sounding confident is not the same as being right.",

        "quiz.q6.text": "An AI chatbot can confidently “quote” facts, books or sources that don't actually exist.",
        "quiz.q6.explain": "True. This is called an AI “hallucination”: the chatbot produces text that sounds believable but is made up. That's why you should always double-check important facts in reliable sources.",

        "quiz.q24.text": "Which of these is generative AI?",
        "quiz.q24.o1": "An app that writes a poem from a one-line request",
        "quiz.q24.o2": "A filter that sorts emails into spam and not spam",
        "quiz.q24.o3": "A camera that unlocks your phone when it sees your face",
        "quiz.q24.o4": "A map app that predicts how busy the roads will be",
        "quiz.q24.explain": "Generative AI creates new content: text, images, music, code or video. The other three are AI too, but they sort, recognise or predict. They don't create anything new.",

        "quiz.q25.text": "A chatbot isn't connected to a search tool. Where does its answer about a historical event come from?",
        "quiz.q25.o1": "From patterns in the text it learned from in training",
        "quiz.q25.o2": "From a quick, hidden search of today's news websites",
        "quiz.q25.o3": "From a database of checked facts it looks up each time",
        "quiz.q25.o4": "From an expert who checks every answer before you see it",
        "quiz.q25.explain": "Without a search tool, a language model writes from what it learned in training: patterns in huge amounts of text. That's why it can be out of date, and why it can make up things that sound right. It has no database of checked facts, and nobody reads its answers before you do.",

        "quiz.q26.text": "Chatbots run on LLMs. What does LLM stand for?",
        "quiz.q26.o1": "Large language model",
        "quiz.q26.o2": "Logical learning machine",
        "quiz.q26.o3": "Live language memory",
        "quiz.q26.o4": "Linked library module",
        "quiz.q26.explain": "LLM means large language model: a huge neural network trained on enormous amounts of text to predict what comes next. “Large” is about its billions of weights and the amount of text it learned from."
    },
    ru: {
        "quiz.q5.text": "Как чат-бот вроде ChatGPT пишет свои ответы?",
        "quiz.q5.o1": "Он раз за разом предсказывает вероятное следующее слово по закономерностям из текстов",
        "quiz.q5.o2": "Он ищет в интернете и вставляет в ответ страницу, которая лучше всего подходит к вопросу",
        "quiz.q5.o3": "Он берёт готовый ответ из гигантской базы данных вопросов и ответов",
        "quiz.q5.o4": "Команда людей очень быстро печатает каждый ответ за кадром",
        "quiz.q5.explain": "Чат-боты работают на больших языковых моделях. Они составляют ответ по маленькому кусочку текста (по «токену») за раз и каждый раз предсказывают, что вероятнее всего будет дальше. Поэтому они звучат так гладко, но уверенный тон ещё не значит, что ответ верный.",

        "quiz.q6.text": "Чат-бот может уверенно «цитировать» факты, книги или источники, которых на самом деле не существует.",
        "quiz.q6.explain": "Верно. Это называют «галлюцинацией» ИИ: чат-бот выдаёт правдоподобный, но выдуманный текст. Поэтому важные факты всегда стоит перепроверять в надёжных источниках.",

        "quiz.q24.text": "Что из этого — генеративный ИИ?",
        "quiz.q24.o1": "Приложение, которое пишет стихи по просьбе в одну строчку",
        "quiz.q24.o2": "Фильтр, который сортирует письма на спам и не спам",
        "quiz.q24.o3": "Камера, которая разблокирует телефон, узнав твоё лицо",
        "quiz.q24.o4": "Карты, которые предсказывают пробки на дорогах",
        "quiz.q24.explain": "Генеративный ИИ создаёт новое: тексты, картинки, музыку, код или видео. Остальные три — тоже ИИ, но они сортируют, узнают или предсказывают, а ничего нового не создают.",

        "quiz.q25.text": "Чат-бот не подключён к поиску. Откуда берётся его ответ об историческом событии?",
        "quiz.q25.o1": "Из закономерностей в текстах, на которых он обучался",
        "quiz.q25.o2": "Из быстрого незаметного поиска по новостным сайтам",
        "quiz.q25.o3": "Из базы проверенных фактов, которую он каждый раз смотрит",
        "quiz.q25.o4": "От эксперта, который заранее проверяет каждый ответ",
        "quiz.q25.explain": "Без поиска языковая модель пишет на основе того, чему научилась: закономерностей в огромном количестве текстов. Поэтому её знания могут устареть, а сама она может выдумать то, что звучит правдоподобно. Базы проверенных фактов у неё нет, и никто не читает её ответы раньше тебя.",

        "quiz.q26.text": "Чат-боты работают на LLM. Как расшифровывается LLM?",
        "quiz.q26.o1": "Large language model — большая языковая модель",
        "quiz.q26.o2": "Logical learning machine — логическая обучаемая машина",
        "quiz.q26.o3": "Live language memory — живая языковая память",
        "quiz.q26.o4": "Linked library module — связанный модуль библиотеки",
        "quiz.q26.explain": "LLM — это large language model, большая языковая модель: огромная нейросеть, обученная на гигантском количестве текстов предсказывать, что будет дальше. «Большая» — это про миллиарды весов и объём текстов, на которых она училась."
    }
});

// ----- Lesson 5: AI in Everyday Life -----
window.AICompass.addTranslations({
    en: {
        "quiz.q9.text": "Which of these everyday things usually uses AI?",
        "quiz.q9.o1": "Video recommendations on YouTube or TikTok",
        "quiz.q9.o2": "A pocket calculator doing long multiplication",
        "quiz.q9.o3": "A digital alarm clock that rings at a set time",
        "quiz.q9.o4": "A microwave counting down from two minutes",
        "quiz.q9.explain": "Recommendation systems learn from what you watch, like and skip, and guess what you'll want to see next. A calculator, an alarm clock and a microwave timer just follow fixed rules: they're useful, but they don't learn or adapt to you.",

        "quiz.q27.text": "Your feed shows you more and more videos that match what you already like and believe. What is this called?",
        "quiz.q27.o1": "A filter bubble",
        "quiz.q27.o2": "A deepfake",
        "quiz.q27.o3": "A hallucination",
        "quiz.q27.o4": "Overfitting",
        "quiz.q27.explain": "When a recommendation system keeps showing you more of the same, you can end up in a filter bubble and rarely see other topics or views. Searching for new topics and following different voices helps you get out. A deepfake is a fake photo, video or voice, and a hallucination is when a chatbot makes something up.",

        "quiz.q28.text": "Some AI features on a phone, such as face unlock, work even without an Internet connection.",
        "quiz.q28.explain": "True. Many AI features run right on the phone, often on a special chip called a neural processing unit (NPU). Face unlock has to work in airplane mode too.",

        "quiz.q29.text": "AlphaFold helped scientists win the 2024 Nobel Prize in Chemistry. What does it predict?",
        "quiz.q29.o1": "The 3D shapes of proteins",
        "quiz.q29.o2": "How fast new viruses will spread",
        "quiz.q29.o3": "The weather a week in advance",
        "quiz.q29.o4": "Which stars have planets like Earth",
        "quiz.q29.explain": "AlphaFold predicts how a protein folds into its 3D shape, which used to take months or even years of lab work for a single protein. Demis Hassabis and John Jumper shared the 2024 Nobel Prize in Chemistry for it, together with David Baker, who designs new proteins on computers."
    },
    ru: {
        "quiz.q9.text": "Что из этого в повседневной жизни обычно использует ИИ?",
        "quiz.q9.o1": "Рекомендации видео в YouTube или TikTok",
        "quiz.q9.o2": "Калькулятор, который перемножает длинные числа",
        "quiz.q9.o3": "Электронный будильник, который звонит в заданное время",
        "quiz.q9.o4": "Микроволновка, которая отсчитывает две минуты",
        "quiz.q9.explain": "Рекомендательные системы учатся на том, что ты смотришь, лайкаешь и пропускаешь, и угадывают, что тебе захочется увидеть дальше. Калькулятор, будильник и таймер микроволновки просто выполняют заданные правила: они полезны, но ничему не учатся и не подстраиваются под тебя.",

        "quiz.q27.text": "Лента показывает тебе всё больше видео, которые совпадают с тем, что тебе уже нравится и во что ты веришь. Как это называется?",
        "quiz.q27.o1": "Пузырь фильтров",
        "quiz.q27.o2": "Дипфейк",
        "quiz.q27.o3": "Галлюцинация",
        "quiz.q27.o4": "Переобучение",
        "quiz.q27.explain": "Когда рекомендательная система всё время показывает похожее, можно оказаться в пузыре фильтров и почти не видеть других тем и мнений. Выбраться помогают поиск новых тем и подписки на разных авторов. Дипфейк — это поддельное фото, видео или голос, а галлюцинация — когда чат-бот что-то выдумывает.",

        "quiz.q28.text": "Некоторые функции ИИ в телефоне, например разблокировка по лицу, работают даже без интернета.",
        "quiz.q28.explain": "Верно. Многие функции ИИ работают прямо в телефоне, часто на специальном чипе — нейропроцессоре (NPU). Разблокировка по лицу должна работать и в режиме полёта.",

        "quiz.q29.text": "AlphaFold помог учёным получить Нобелевскую премию по химии 2024 года. Что он предсказывает?",
        "quiz.q29.o1": "Трёхмерную форму белков",
        "quiz.q29.o2": "Как быстро распространятся новые вирусы",
        "quiz.q29.o3": "Погоду на неделю вперёд",
        "quiz.q29.o4": "У каких звёзд есть планеты, похожие на Землю",
        "quiz.q29.explain": "AlphaFold предсказывает, как белок сворачивается в трёхмерную форму, — раньше на один белок уходили месяцы, а то и годы лабораторной работы. За это Демис Хассабис и Джон Джампер разделили Нобелевскую премию по химии 2024 года с Дэвидом Бейкером, который проектирует новые белки на компьютере."
    }
});

// ----- Lesson 6: AI Ethics & Safety -----
window.AICompass.addTranslations({
    en: {
        "quiz.q7.text": "A face-recognition system was trained mostly on photos of people with light skin. What is the most likely problem?",
        "quiz.q7.o1": "It may be less accurate for people with darker skin",
        "quiz.q7.o2": "It will work equally well for everyone, because all faces are similar",
        "quiz.q7.o3": "It will only recognise faces in bright, sunny photos",
        "quiz.q7.o4": "No problem: the AI fills in the gaps in its training data by itself",
        "quiz.q7.explain": "This is called AI bias. AI learns from its data, and it can't fill in what's missing by itself. If some groups of people are under-represented, the system can be less accurate or unfair to them. Researchers have found exactly this problem in real face-recognition systems, which is why diverse, balanced data matters.",

        "quiz.q8.text": "Which of these is the safest thing to type into an online AI chatbot?",
        "quiz.q8.o1": "A general question, like “How do volcanoes work?”",
        "quiz.q8.o2": "Your full name and school, so its answers fit you better",
        "quiz.q8.o3": "Your password, so it can tell you if it's strong enough",
        "quiz.q8.o4": "A screenshot of your group chat with your friends' messages",
        "quiz.q8.explain": "What you type into a chatbot may be stored and sometimes used to improve the AI. Never share passwords or personal details like your full name, address or school, and don't share other people's private messages either.",

        "quiz.q12.text": "What is the most responsible way to use AI for a school essay?",
        "quiz.q12.o1": "Use it for ideas, check its facts, write it yourself and say how it helped",
        "quiz.q12.o2": "Let it write the whole essay, then change a few words so it sounds like you",
        "quiz.q12.o3": "Trust its facts and quotes, because it has read millions of books",
        "quiz.q12.o4": "Use it however you like, as long as your teacher can't tell",
        "quiz.q12.explain": "AI can be a great study buddy, but you are responsible for your work. Follow your school's rules, check facts in reliable sources, keep thinking for yourself, and be honest about when and how AI helped you.",

        "quiz.q30.text": "A shocking video of a famous person is spreading fast. What is the best way to tell whether it's a deepfake?",
        "quiz.q30.o1": "Check who posted it and whether trusted news reports it",
        "quiz.q30.o2": "Look closely for blurry edges and strange blinking",
        "quiz.q30.o3": "Trust it if it has millions of views and shares",
        "quiz.q30.o4": "Ask a chatbot to watch it and decide for you",
        "quiz.q30.explain": "Fakes keep getting better, so looking for glitches works less and less. Checking the source works whatever the technology: who posted it first, and do trusted news sources report it? Millions of views only show that it spreads, not that it's true, and a chatbot can't reliably spot a fake either.",

        "quiz.q31.text": "When an AI system makes a harmful mistake, nobody is responsible, because a computer made the decision.",
        "quiz.q31.explain": "False. The people and companies who build and use an AI system are responsible for what it does. That's why important decisions, in medicine, courts or hiring, should always be checked by a human."
    },
    ru: {
        "quiz.q7.text": "Систему распознавания лиц обучали в основном на фотографиях людей со светлой кожей. Какая проблема наиболее вероятна?",
        "quiz.q7.o1": "Она может хуже узнавать людей с тёмной кожей",
        "quiz.q7.o2": "Она будет одинаково хорошо работать для всех: лица ведь похожи",
        "quiz.q7.o3": "Она будет узнавать лица только на ярких солнечных фото",
        "quiz.q7.o4": "Никакой: ИИ сам восполнит пробелы в данных, на которых учился",
        "quiz.q7.explain": "Это называют предвзятостью ИИ. ИИ учится на данных и сам не восполнит то, чего в них нет. Если каких-то групп людей в данных мало, система может работать для них хуже или несправедливо. Исследователи находили такую проблему в реальных системах распознавания лиц, поэтому так важны разнообразные данные.",

        "quiz.q8.text": "Что из этого безопаснее всего написать онлайн-чат-боту?",
        "quiz.q8.o1": "Общий вопрос, например «Как устроены вулканы?»",
        "quiz.q8.o2": "Своё полное имя и номер школы, чтобы ответы подходили именно тебе",
        "quiz.q8.o3": "Свой пароль, чтобы чат-бот проверил, достаточно ли он надёжный",
        "quiz.q8.o4": "Скриншот группового чата с сообщениями твоих друзей",
        "quiz.q8.explain": "То, что ты пишешь чат-боту, может сохраняться и иногда использоваться для улучшения ИИ. Никогда не делись паролями и личными данными — полным именем, адресом, номером школы — и не пересылай чужие личные сообщения.",

        "quiz.q12.text": "Как ответственнее всего использовать ИИ при написании школьного эссе?",
        "quiz.q12.o1": "Брать идеи, проверять факты, писать текст самостоятельно и честно говорить, как помог ИИ",
        "quiz.q12.o2": "Поручить ему всё эссе, а потом заменить пару слов, чтобы текст звучал как твой",
        "quiz.q12.o3": "Доверять его фактам и цитатам — он ведь прочитал миллионы книг",
        "quiz.q12.o4": "Пользоваться им как угодно, лишь бы учитель не догадался",
        "quiz.q12.explain": "ИИ может быть отличным помощником в учёбе, но за свою работу отвечаешь ты. Соблюдай правила школы, проверяй факты в надёжных источниках, думай своей головой и честно говори, когда и как тебе помогал ИИ.",

        "quiz.q30.text": "Шокирующее видео со знаменитостью быстро разлетается по сети. Как лучше всего понять, не дипфейк ли это?",
        "quiz.q30.o1": "Проверить, кто его выложил и пишут ли о нём надёжные СМИ",
        "quiz.q30.o2": "Присмотреться к размытым краям и странному морганию",
        "quiz.q30.o3": "Поверить, если у него миллионы просмотров и репостов",
        "quiz.q30.o4": "Попросить чат-бот посмотреть его и решить за тебя",
        "quiz.q30.explain": "Подделки становятся всё лучше, поэтому искать в них ошибки всё бесполезнее. А проверка источника работает при любых технологиях: кто выложил видео первым и пишут ли о нём надёжные СМИ? Миллионы просмотров говорят лишь о том, что видео разлетелось, а не о том, что оно правдиво. И чат-бот тоже не умеет надёжно распознавать подделки.",

        "quiz.q31.text": "Если система ИИ совершила опасную ошибку, никто не виноват: решение ведь принял компьютер.",
        "quiz.q31.explain": "Неверно. За то, что делает система ИИ, отвечают люди и компании, которые её создают и используют. Поэтому важные решения — в медицине, в суде, при приёме на работу — всегда должен проверять человек."
    }
});

// ----- Lesson 7: How Computers See -----
window.AICompass.addTranslations({
    en: {
        "quiz.q32.text": "To a computer, what is a black-and-white photo?",
        "quiz.q32.o1": "A grid of numbers, one for each pixel",
        "quiz.q32.o2": "A list of the objects that are in it",
        "quiz.q32.o3": "A short description written in words",
        "quiz.q32.o4": "A tiny copy of the scene, made of light",
        "quiz.q32.explain": "A computer stores a picture as pixels, and each pixel is just a number: in a greyscale picture, 0 is black, 255 is white, and the numbers in between are greys. A colour pixel has three numbers, for red, green and blue. Finding objects in all those numbers is exactly what vision models have to learn.",

        "quiz.q33.text": "A small grid of numbers slides over a picture, and at each spot the numbers under it are multiplied and added up. What is this called?",
        "quiz.q33.o1": "A convolution",
        "quiz.q33.o2": "A pixelation",
        "quiz.q33.o3": "A compression",
        "quiz.q33.o4": "A projection",
        "quiz.q33.explain": "This sliding and adding is a convolution, and the small grid is a filter. Where the picture has the pattern the filter looks for, such as an edge, the sum is big. A convolutional neural network (CNN) learns the numbers of its own filters from examples.",

        "quiz.q34.text": "Researchers added a faint pattern of noise to a photo of a panda. People still saw a panda, but the network said “gibbon”, and was very sure. What is a picture like this called?",
        "quiz.q34.o1": "An adversarial example",
        "quiz.q34.o2": "A hallucination",
        "quiz.q34.o3": "A deepfake",
        "quiz.q34.o4": "An overfitted photo",
        "quiz.q34.explain": "An adversarial example is a picture changed in a tiny, carefully chosen way, so that a model sees something completely different while people notice nothing. It shows that vision models find patterns, not meaning. It isn't a deepfake: nobody made a fake panda, the photo just got some invisible noise.",

        "quiz.q35.text": "A well-trained face-unlock system works equally well in any light and from any angle.",
        "quiz.q35.explain": "False. Vision models find patterns like the ones in their training photos. Bad lighting, an unusual angle or a picture unlike the training photos can confuse them, which is why such systems are tested in many different conditions."
    },
    ru: {
        "quiz.q32.text": "Что для компьютера чёрно-белая фотография?",
        "quiz.q32.o1": "Сетка чисел — по одному на каждый пиксель",
        "quiz.q32.o2": "Список предметов, которые на ней есть",
        "quiz.q32.o3": "Короткое описание словами",
        "quiz.q32.o4": "Крошечная копия сцены, сделанная из света",
        "quiz.q32.explain": "Компьютер хранит картинку как пиксели, а каждый пиксель — это просто число: в оттенках серого 0 — чёрный, 255 — белый, а числа между ними — серые. У цветного пикселя три числа: для красного, зелёного и синего. А найти предметы во всех этих числах — как раз то, чему должны научиться модели компьютерного зрения.",

        "quiz.q33.text": "Маленькая сетка чисел скользит по картинке, и в каждом месте числа под ней перемножаются и складываются. Как это называется?",
        "quiz.q33.o1": "Свёртка",
        "quiz.q33.o2": "Пикселизация",
        "quiz.q33.o3": "Сжатие",
        "quiz.q33.o4": "Проекция",
        "quiz.q33.explain": "Такое скольжение со сложением называется свёрткой, а маленькая сетка — фильтром. Там, где на картинке есть узор, который ищет фильтр, например край, сумма получается большой. Свёрточная нейронная сеть (CNN) сама подбирает числа своих фильтров на примерах.",

        "quiz.q34.text": "Исследователи добавили к фото панды едва заметный шум. Люди по-прежнему видели панду, а нейросеть уверенно ответила «гиббон». Как называют такую картинку?",
        "quiz.q34.o1": "Состязательный пример",
        "quiz.q34.o2": "Галлюцинация",
        "quiz.q34.o3": "Дипфейк",
        "quiz.q34.o4": "Переобученное фото",
        "quiz.q34.explain": "Состязательный пример — это картинка, изменённая совсем чуть-чуть, но очень хитро: модель видит на ней что-то совсем другое, а люди не замечают никакой разницы. Это показывает, что модели зрения находят закономерности, а не смысл. И это не дипфейк: никто не подделывал панду, к фото просто добавили незаметный шум.",

        "quiz.q35.text": "Хорошо обученная система разблокировки по лицу одинаково надёжно работает при любом освещении и под любым углом.",
        "quiz.q35.explain": "Неверно. Модели зрения находят закономерности, похожие на те, что были в обучающих фото. Плохое освещение, необычный угол или снимок, не похожий на обучающие, могут их запутать, — поэтому такие системы проверяют в самых разных условиях."
    }
});

// ----- Lesson 8: Learning by Trial and Error -----
window.AICompass.addTranslations({
    en: {
        "quiz.q36.text": "In reinforcement learning, how does an agent find out which actions are good?",
        "quiz.q36.o1": "From the rewards it gets after trying different actions",
        "quiz.q36.o2": "From a list of correct moves that a teacher gives it",
        "quiz.q36.o3": "From photos labelled “good move” or “bad move”",
        "quiz.q36.o4": "By copying the moves of the agent next to it",
        "quiz.q36.explain": "Nobody shows a reinforcement learning agent the right moves. It acts, gets a reward (a number that says how well it did, like points in a game) and slowly works out which actions bring the most reward over time. Learning from labelled examples is supervised learning.",

        "quiz.q37.text": "Your music app mostly plays songs you already love, but now and then it slips in something completely new. What is it doing with the new song?",
        "quiz.q37.o1": "Exploration: trying something new to learn more",
        "quiz.q37.o2": "Exploitation: using only what is known to work",
        "quiz.q37.o3": "Reward hacking: finding a loophole in its reward",
        "quiz.q37.o4": "Overfitting: memorising songs instead of tastes",
        "quiz.q37.explain": "Trying something new to learn more is exploration; playing what already works is exploitation. An agent (or an app) that only exploits can get stuck with “good enough”, so a good one explores a small part of the time. Nothing is being hacked: the app is learning what else you might like.",

        "quiz.q38.text": "In 2016, the program AlphaGo beat Lee Sedol, one of the world's best players of the board game Go.",
        "quiz.q38.explain": "True. AlphaGo, made by DeepMind, won the match 4–1 in March 2016. It learned partly by playing millions of games against itself, a kind of reinforcement learning. Go has so many possible positions that many experts had thought this was still years away.",

        "quiz.q39.text": "In a boat-racing game, an agent got points for hitting targets. It found a lagoon where it could circle forever, hitting the same targets, and never finished the race. What would fix this best?",
        "quiz.q39.o1": "Reward finishing the race, not just hitting targets",
        "quiz.q39.o2": "Let the agent explore new routes more often",
        "quiz.q39.o3": "Train it for many more games with the same reward",
        "quiz.q39.o4": "Give it more points for every target it hits",
        "quiz.q39.explain": "This is reward hacking: the agent chases the reward it gets, not what its designers meant. More exploration or more training with the same reward would only help it find the loophole faster, and more points per target would make circling even better. The reward itself has to describe what we really want: winning the race."
    },
    ru: {
        "quiz.q36.text": "Как в обучении с подкреплением агент узнаёт, какие действия хорошие?",
        "quiz.q36.o1": "По наградам, которые он получает, пробуя разные действия",
        "quiz.q36.o2": "По списку правильных ходов, который даёт ему учитель",
        "quiz.q36.o3": "По фото с подписями «хороший ход» и «плохой ход»",
        "quiz.q36.o4": "Повторяя ходы агента, который стоит рядом",
        "quiz.q36.explain": "Агенту в обучении с подкреплением никто не показывает правильных ходов. Он действует, получает награду — число, которое говорит, насколько хорошо он справился, как очки в игре, — и постепенно понимает, какие действия приносят больше всего награды. А учиться на примерах с метками — это обучение с учителем.",

        "quiz.q37.text": "Музыкальное приложение обычно включает песни, которые ты любишь, но иногда подсовывает что-то совсем новое. Что оно делает, включая новую песню?",
        "quiz.q37.o1": "Исследует: пробует новое, чтобы узнать больше",
        "quiz.q37.o2": "Использует: ставит только то, что точно работает",
        "quiz.q37.o3": "Взламывает награду: ищет в ней лазейку",
        "quiz.q37.o4": "Переобучается: запоминает песни, а не вкусы",
        "quiz.q37.explain": "Пробовать новое, чтобы узнать больше, — это исследование, а ставить то, что уже работает, — использование. Агент (или приложение), который только использует, может застрять на «и так сойдёт», поэтому хороший агент иногда исследует. Ничего тут не взламывают: приложение узнаёт, что ещё может тебе понравиться.",

        "quiz.q38.text": "В 2016 году программа AlphaGo обыграла Ли Седоля — одного из сильнейших в мире игроков в настольную игру го.",
        "quiz.q38.explain": "Верно. AlphaGo от компании DeepMind выиграла матч со счётом 4:1 в марте 2016 года. Она училась в том числе на миллионах партий против самой себя — это обучение с подкреплением. В го так много возможных позиций, что многие эксперты думали: до такой победы ещё годы.",

        "quiz.q39.text": "В игре про гонки на лодках агент получал очки за сбитые мишени. Он нашёл лагуну, где мог бесконечно кружить, сбивая одни и те же мишени, и так и не доплыл до финиша. Что лучше всего это исправит?",
        "quiz.q39.o1": "Давать награду за финиш, а не только за мишени",
        "quiz.q39.o2": "Чаще разрешать агенту пробовать новые маршруты",
        "quiz.q39.o3": "Обучать его гораздо дольше с той же наградой",
        "quiz.q39.o4": "Давать больше очков за каждую мишень",
        "quiz.q39.explain": "Это взлом награды: агент гонится за наградой, а не за тем, что имели в виду разработчики. Больше исследования или больше обучения с той же наградой только помогут быстрее найти лазейку, а больше очков за мишень сделают кружение ещё выгоднее. Сама награда должна описывать то, чего мы действительно хотим, — победу в гонке."
    }
});

// ----- Lesson 9: How Chatbots Write -----
window.AICompass.addTranslations({
    en: {
        "quiz.q40.text": "Before a chatbot can work with your message, what does it cut the text into?",
        "quiz.q40.o1": "Tokens: words and parts of words",
        "quiz.q40.o2": "Single letters, one at a time",
        "quiz.q40.o3": "Whole sentences, one at a time",
        "quiz.q40.o4": "Pixels, like a photo of the text",
        "quiz.q40.explain": "Text is cut into tokens, such as short words, parts of longer words and punctuation marks, and each token gets a number. “Unbelievable” might become “un”, “believ” and “able”. So to the model, your message is a list of numbers.",

        "quiz.q41.text": "What happens when you turn up a chatbot's temperature setting?",
        "quiz.q41.o1": "Its word choices get more random and creative",
        "quiz.q41.o2": "It answers faster and uses more computer power",
        "quiz.q41.o3": "It gets friendlier and uses more emoji",
        "quiz.q41.o4": "It checks its facts more carefully first",
        "quiz.q41.explain": "Temperature changes how the model picks the next token. At a low temperature it almost always takes the most likely one (safe, but a bit dull); at a high temperature, unlikely tokens get more chances (more creative, but more mistakes). It has nothing to do with speed, mood or fact-checking.",

        "quiz.q42.text": "“The robot dropped the box because it was heavy.” What lets a language model work out that “it” means the box?",
        "quiz.q42.o1": "Attention: weighing how much each earlier word matters",
        "quiz.q42.o2": "Temperature: picking the word with the highest score",
        "quiz.q42.o3": "A dictionary that lists what every word refers to",
        "quiz.q42.o4": "Tokens: the word “it” always gets the box's number",
        "quiz.q42.explain": "Attention lets the model look back at every earlier token and weigh how much each one matters for the next step. In “…because it was clumsy”, the same “it” would point to the robot, so no fixed dictionary could get both right. Models built on attention are called transformers.",

        "quiz.q43.text": "The “T” in GPT stands for “transformer”, a type of model built on attention.",
        "quiz.q43.explain": "True. GPT means Generative Pre-trained Transformer. Transformers were introduced in 2017, in a Google paper called “Attention Is All You Need”, and most big chatbots of the 2020s are built on them.",

        "quiz.q44.text": "How is a chatbot taught to give helpful, polite answers instead of just continuing any text?",
        "quiz.q44.o1": "Fine-tuning with good examples and human feedback",
        "quiz.q44.o2": "A list of polite phrases it must put in every answer",
        "quiz.q44.o3": "It learns from each chat with you, as you talk",
        "quiz.q44.o4": "Its programmers write every possible answer in advance",
        "quiz.q44.explain": "First the model is pre-trained on huge amounts of text, which only teaches it to continue text. Then it is fine-tuned on examples of good answers and with human feedback (RLHF): people compare answers, and the model is rewarded for the kind they prefer. The model itself doesn't change while you chat: its training happened before."
    },
    ru: {
        "quiz.q40.text": "На что чат-бот разрезает твоё сообщение, прежде чем с ним работать?",
        "quiz.q40.o1": "На токены — слова и части слов",
        "quiz.q40.o2": "На отдельные буквы, по одной",
        "quiz.q40.o3": "На целые предложения, по одному",
        "quiz.q40.o4": "На пиксели, как фото текста",
        "quiz.q40.explain": "Текст разрезают на токены — короткие слова, части длинных слов и знаки препинания, и каждый токен получает номер. Слово «невероятный» может превратиться, например, в «не», «вероят» и «ный». Так что для модели твоё сообщение — это список чисел.",

        "quiz.q41.text": "Что будет, если повысить чат-боту настройку «температура»?",
        "quiz.q41.o1": "Он будет выбирать слова смелее и разнообразнее",
        "quiz.q41.o2": "Он будет отвечать быстрее и тратить больше мощности",
        "quiz.q41.o3": "Он станет дружелюбнее и добавит больше эмодзи",
        "quiz.q41.o4": "Он будет тщательнее проверять факты перед ответом",
        "quiz.q41.explain": "Температура меняет то, как модель выбирает следующий токен. При низкой температуре она почти всегда берёт самый вероятный (надёжно, но скучновато), а при высокой маловероятные токены получают больше шансов (больше творчества, но и больше ошибок). К скорости, настроению или проверке фактов это отношения не имеет.",

        "quiz.q42.text": "«Робот уронил чемодан, потому что он был тяжёлым». Что помогает языковой модели понять, что «он» — это чемодан?",
        "quiz.q42.o1": "Механизм внимания: он взвешивает, насколько важно каждое прежнее слово",
        "quiz.q42.o2": "Температура: она выбирает слово с самой высокой оценкой",
        "quiz.q42.o3": "Словарь, где записано, к чему относится каждое слово",
        "quiz.q42.o4": "Токены: слово «он» всегда получает номер чемодана",
        "quiz.q42.explain": "Механизм внимания позволяет модели оглянуться на все прежние токены и взвесить, насколько каждый важен для следующего шага. Во фразе «…потому что он был неуклюжим» то же самое «он» указывало бы на робота, так что никакой готовый словарь не справился бы с обоими случаями. Модели, построенные на внимании, называют трансформерами.",

        "quiz.q43.text": "Буква «T» в названии GPT означает «трансформер» — тип модели, построенный на механизме внимания.",
        "quiz.q43.explain": "Верно. GPT — это Generative Pre-trained Transformer, «генеративный предобученный трансформер». Трансформеры появились в 2017 году в статье исследователей Google «Attention Is All You Need» («Внимание — это всё, что нужно»), и на них построено большинство крупных чат-ботов 2020-х.",

        "quiz.q44.text": "Как чат-бот учат давать полезные и вежливые ответы, а не просто продолжать любой текст?",
        "quiz.q44.o1": "Дообучают на хороших примерах и отзывах людей",
        "quiz.q44.o2": "Дают список вежливых фраз для каждого ответа",
        "quiz.q44.o3": "Он учится на каждом разговоре с тобой прямо по ходу",
        "quiz.q44.o4": "Программисты заранее пишут все возможные ответы",
        "quiz.q44.explain": "Сначала модель предобучают на огромном количестве текстов — это учит её только продолжать текст. Потом её дообучают на примерах хороших ответов и с помощью отзывов людей (RLHF): люди сравнивают ответы, и модель получает награду за те, что понравились больше. А пока ты общаешься с ботом, сама модель не меняется: её обучение закончилось раньше."
    }
});

// ----- Lesson 10: Creative AI -----
window.AICompass.addTranslations({
    en: {
        "quiz.q45.text": "How does a diffusion model, a common kind of image generator, make a picture?",
        "quiz.q45.o1": "It starts from random noise and removes it step by step",
        "quiz.q45.o2": "It cuts pieces out of real photos and glues them together",
        "quiz.q45.o3": "It searches the Internet for the closest matching picture",
        "quiz.q45.o4": "It draws the outlines first, then fills in the colours",
        "quiz.q45.explain": "A diffusion model learns to remove noise. To make a picture, it starts from pure noise and cleans it up in many small steps, guided by your prompt, until a new image appears. It doesn't glue pieces of photos together or look the picture up: it builds a new one from the patterns it learned.",

        "quiz.q46.text": "A GAN, an earlier kind of image generator from 2014, trains two networks against each other. What do they do?",
        "quiz.q46.o1": "One makes fake images, the other tries to spot the fakes",
        "quiz.q46.o2": "One draws the left half of a picture, the other the right",
        "quiz.q46.o3": "One writes the prompt, the other turns it into a picture",
        "quiz.q46.o4": "One learns from photos, the other learns from drawings",
        "quiz.q46.explain": "In a generative adversarial network (GAN), a generator makes fakes, like a forger, and a discriminator tries to tell them from real images, like a detective. Each one improves by competing with the other, until the fakes are hard to spot. GANs were introduced in 2014 by Ian Goodfellow and colleagues.",

        "quiz.q47.text": "Some AI image tools hide an invisible mark in every picture they make. What is it for?",
        "quiz.q47.o1": "To show later that the picture was made by AI",
        "quiz.q47.o2": "To make the picture look sharper when it's printed",
        "quiz.q47.o3": "To stop anyone from taking a screenshot of it",
        "quiz.q47.o4": "To pay the artists whose work the model learned from",
        "quiz.q47.explain": "This is an AI watermark: a hidden signal that special tools can read to tell that an image was made by AI. Together with visible labels, it helps people know what is real. Watermarks aren't perfect, because heavy editing can damage or remove some of them, and they don't stop screenshots or pay anyone.",

        "quiz.q48.text": "Any photo that has been edited with a filter app counts as a deepfake.",
        "quiz.q48.explain": "False. A filter that brightens a photo or smooths skin isn't a deepfake. A deepfake uses AI to make a fake but realistic photo, video or voice, often of a real person saying or doing something they never did."
    },
    ru: {
        "quiz.q45.text": "Как рисует картинку диффузионная модель — один из самых распространённых видов генераторов изображений?",
        "quiz.q45.o1": "Начинает со случайного шума и убирает его шаг за шагом",
        "quiz.q45.o2": "Вырезает куски из настоящих фото и склеивает их",
        "quiz.q45.o3": "Ищет в интернете самую похожую картинку",
        "quiz.q45.o4": "Сначала рисует контуры, а потом раскрашивает",
        "quiz.q45.explain": "Диффузионная модель учится убирать шум. Чтобы нарисовать картинку, она начинает с чистого шума и много раз понемногу его очищает, следуя твоему запросу, пока не появится новое изображение. Она не склеивает куски фотографий и не ищет готовую картинку: она строит новую по закономерностям, которые выучила.",

        "quiz.q46.text": "GAN — более ранний вид генератора изображений, появившийся в 2014 году, — обучает две сети друг против друга. Что они делают?",
        "quiz.q46.o1": "Одна создаёт подделки, другая пытается их распознать",
        "quiz.q46.o2": "Одна рисует левую половину картинки, другая — правую",
        "quiz.q46.o3": "Одна пишет запрос, другая превращает его в картинку",
        "quiz.q46.o4": "Одна учится на фотографиях, другая — на рисунках",
        "quiz.q46.explain": "В генеративно-состязательной сети (GAN) генератор создаёт подделки, как фальшивомонетчик, а дискриминатор пытается отличить их от настоящих изображений, как детектив. Соревнуясь, обе сети становятся лучше, пока подделки не станет трудно распознать. GAN придумали в 2014 году Ян Гудфеллоу и его коллеги.",

        "quiz.q47.text": "Некоторые ИИ-генераторы прячут в каждую созданную картинку невидимую метку. Зачем она?",
        "quiz.q47.o1": "Чтобы потом можно было узнать, что картинку сделал ИИ",
        "quiz.q47.o2": "Чтобы картинка выглядела чётче при печати",
        "quiz.q47.o3": "Чтобы никто не мог сделать её скриншот",
        "quiz.q47.o4": "Чтобы платить художникам, на чьих работах училась модель",
        "quiz.q47.explain": "Это водяной знак ИИ — скрытый сигнал, по которому специальные программы могут определить, что изображение создал ИИ. Вместе с видимыми пометками он помогает людям понять, что настоящее, а что нет. Водяные знаки не идеальны: сильная обработка может некоторые из них повредить или стереть. И они не мешают делать скриншоты и никому не платят.",

        "quiz.q48.text": "Любое фото, обработанное фильтром в приложении, считается дипфейком.",
        "quiz.q48.explain": "Неверно. Фильтр, который делает фото ярче или сглаживает кожу, — это не дипфейк. Дипфейк — это поддельные, но реалистичные фото, видео или голос, созданные с помощью ИИ, часто с реальным человеком, который говорит или делает то, чего никогда не говорил и не делал."
    }
});

// ----- Lesson 11: Can You Trust AI? -----
window.AICompass.addTranslations({
    en: {
        "quiz.q49.text": "In 2018, news reports revealed that Amazon had dropped an experimental hiring tool. What was wrong with it?",
        "quiz.q49.o1": "It was biased against women: it learned from past CVs",
        "quiz.q49.o2": "It hired too many people: it never said no to anyone",
        "quiz.q49.o3": "It was too slow: it took days to read each CV",
        "quiz.q49.o4": "It leaked every applicant's CV onto the Internet",
        "quiz.q49.explain": "The tool learned from ten years of CVs that mostly came from men, and it learned that unfairness: it marked down CVs that mentioned women's activities, such as a women's chess club. An AI copies the patterns of its history, unfair ones included, which is why hiring tools need careful testing and people checking them.",

        "quiz.q50.text": "A face-unlock system is right 95% of the time in tests. Why might that not be good enough?",
        "quiz.q50.o1": "It may fail much more often for some groups of people",
        "quiz.q50.o2": "Tests with real faces can't tell you anything useful",
        "quiz.q50.o3": "A system that is right 95% of the time can't improve",
        "quiz.q50.o4": "Only 100% accuracy is allowed for any AI system",
        "quiz.q50.explain": "One overall number can hide big differences. If most test photos showed one group of people, the system could be right almost every time for them and wrong far more often for others. Good testing checks different groups and unusual cases, not just the average.",

        "quiz.q51.text": "Before releasing a chatbot, a company asks people to try hard to make it fail or say harmful things. What is this called?",
        "quiz.q51.o1": "Red teaming",
        "quiz.q51.o2": "Fine-tuning",
        "quiz.q51.o3": "Data labelling",
        "quiz.q51.o4": "Overfitting",
        "quiz.q51.explain": "In red teaming, testers attack a system on purpose to find its weak spots before bad actors do. It's one of the ways companies test AI for safety. Fine-tuning is extra training, and data labelling means adding the right answers to examples.",

        "quiz.q52.text": "In 2024, the European Union adopted the AI Act, a broad law about how AI may be used.",
        "quiz.q52.explain": "True. The EU AI Act sorts uses of AI by risk: the riskier the use, the stricter the rules, and a few uses are banned altogether. It is often called the world's first comprehensive law on AI.",

        "quiz.q53.text": "What does “alignment” mean in AI safety?",
        "quiz.q53.o1": "Making AI do what people really intend, safely",
        "quiz.q53.o2": "Lining up the chips inside a computer correctly",
        "quiz.q53.o3": "Making every chatbot give exactly the same answer",
        "quiz.q53.o4": "Training a model on data sorted into neat rows",
        "quiz.q53.explain": "Alignment means getting AI systems to do what people actually intend, not just what they were literally told or rewarded for. Reward hacking shows why this is hard: an agent can follow its instructions perfectly and still miss the point."
    },
    ru: {
        "quiz.q49.text": "В 2018 году в новостях рассказали, что Amazon отказалась от экспериментальной программы для отбора кандидатов на работу. Что с ней было не так?",
        "quiz.q49.o1": "Она была предвзята к женщинам: училась на старых резюме",
        "quiz.q49.o2": "Она нанимала слишком многих: никому не отказывала",
        "quiz.q49.o3": "Она была слишком медленной: читала резюме по нескольку дней",
        "quiz.q49.o4": "Она выложила резюме всех кандидатов в интернет",
        "quiz.q49.explain": "Программа училась на резюме за десять лет, которые в основном присылали мужчины, — и переняла эту несправедливость: занижала оценку резюме, где упоминалось что-то «женское», например женский шахматный клуб. ИИ копирует закономерности прошлого, в том числе несправедливые, поэтому программы для найма нужно тщательно проверять, а их решения — перепроверять людям.",

        "quiz.q50.text": "Система разблокировки по лицу в тестах права в 95% случаев. Почему этого может быть недостаточно?",
        "quiz.q50.o1": "Для некоторых групп людей она может ошибаться гораздо чаще",
        "quiz.q50.o2": "Тесты на реальных лицах ничего полезного не показывают",
        "quiz.q50.o3": "Система, которая права в 95% случаев, уже не станет лучше",
        "quiz.q50.o4": "Для любой системы ИИ разрешена только точность 100%",
        "quiz.q50.explain": "Одно общее число может скрывать большие различия. Если на большинстве тестовых фото была одна группа людей, система может почти всегда угадывать их и гораздо чаще ошибаться с остальными. Хорошая проверка смотрит на разные группы и необычные случаи, а не только на среднее.",

        "quiz.q51.text": "Перед запуском чат-бота компания просит людей изо всех сил постараться его сломать или заставить сказать что-то вредное. Как это называется?",
        "quiz.q51.o1": "Ред-тиминг",
        "quiz.q51.o2": "Дообучение",
        "quiz.q51.o3": "Разметка данных",
        "quiz.q51.o4": "Переобучение",
        "quiz.q51.explain": "При ред-тиминге тестировщики нарочно атакуют систему, чтобы найти её слабые места раньше злоумышленников. Это один из способов, которыми компании проверяют безопасность ИИ. Дообучение — это дополнительное обучение, а разметка данных — добавление правильных ответов к примерам.",

        "quiz.q52.text": "В 2024 году Европейский союз принял Закон об ИИ (AI Act) — большой закон о том, как можно использовать ИИ.",
        "quiz.q52.explain": "Верно. Закон ЕС об ИИ делит применения ИИ по уровню риска: чем опаснее применение, тем строже правила, а некоторые применения запрещены совсем. Его часто называют первым в мире всеобъемлющим законом об ИИ.",

        "quiz.q53.text": "Что в безопасности ИИ означает «согласование» (alignment)?",
        "quiz.q53.o1": "Добиться, чтобы ИИ делал то, чего на самом деле хотят люди",
        "quiz.q53.o2": "Правильно выровнять чипы внутри компьютера",
        "quiz.q53.o3": "Сделать так, чтобы все чат-боты отвечали одинаково",
        "quiz.q53.o4": "Обучать модель на данных, разложенных ровными рядами",
        "quiz.q53.explain": "Согласование — это работа над тем, чтобы системы ИИ делали то, чего люди действительно хотят, а не просто то, что им буквально сказали или за что их награждают. Взлом награды показывает, почему это трудно: агент может идеально выполнять инструкции и всё равно делать совсем не то."
    }
});

// ----- Lesson 12: Your AI Toolkit -----
window.AICompass.addTranslations({
    en: {
        "quiz.q54.text": "“You are a geography teacher. Explain how volcanoes erupt to my class of 14-year-olds.” Which of these ingredients of a good prompt is missing?",
        "quiz.q54.o1": "The format: how the answer should look",
        "quiz.q54.o2": "The role: who the chatbot should be",
        "quiz.q54.o3": "The task: what the chatbot should do",
        "quiz.q54.o4": "The context: who the answer is for",
        "quiz.q54.explain": "The prompt has a role (a geography teacher), a task (explain how volcanoes erupt) and context (a class of 14-year-olds). It doesn't say how the answer should look: five bullet points, a short story, a quiz? Adding the format, and maybe an example, makes the answer far more useful.",

        "quiz.q55.text": "A chatbot gives you a great quote for your essay, with a link to its source. What should you do before you use it?",
        "quiz.q55.o1": "Open the source and check that the quote is really there",
        "quiz.q55.o2": "Nothing: a quote with a link has always been checked",
        "quiz.q55.o3": "Ask the chatbot if it's sure, and trust what it says",
        "quiz.q55.o4": "Change a few words, so nobody can tell where it's from",
        "quiz.q55.explain": "Chatbots sometimes make up quotes, and even sources. Open the link and check that the source exists and really says that. Asking the chatbot “are you sure?” isn't a check: it may just sound sure again.",

        "quiz.q56.text": "You're stuck on a maths homework problem. What is the best way to use AI?",
        "quiz.q56.o1": "Ask for a hint or the method, then solve it yourself",
        "quiz.q56.o2": "Ask for the final answer and copy it into your work",
        "quiz.q56.o3": "Let it do all your homework, to save time for practice",
        "quiz.q56.o4": "Never use it: AI always gets maths problems wrong",
        "quiz.q56.explain": "Use AI as a tutor, not a ghostwriter: a hint or an explanation helps you learn, and the thinking stays yours. Copying the answer teaches you nothing and is often against school rules. And AI isn't always wrong at maths, but it can be, so check its steps too.",

        "quiz.q57.text": "If a chatbot sounds very sure of an answer, the answer is almost certainly correct.",
        "quiz.q57.explain": "False. Chatbots pick likely words, not checked facts, so they can sound just as sure when they're wrong. Notice when an answer sounds too sure, and check what matters in a trusted source."
    },
    ru: {
        "quiz.q54.text": "«Ты учитель географии. Объясни моему классу, где всем по 14 лет, как извергаются вулканы». Какой из этих частей хорошего промпта здесь не хватает?",
        "quiz.q54.o1": "Формата: как должен выглядеть ответ",
        "quiz.q54.o2": "Роли: кем должен быть чат-бот",
        "quiz.q54.o3": "Задачи: что должен сделать чат-бот",
        "quiz.q54.o4": "Контекста: для кого этот ответ",
        "quiz.q54.explain": "В промпте есть роль (учитель географии), задача (объяснить, как извергаются вулканы) и контекст (класс, где всем по 14 лет). Но не сказано, как должен выглядеть ответ: пять пунктов списком, короткий рассказ, викторина? Если добавить формат, а ещё лучше и пример, ответ станет гораздо полезнее.",

        "quiz.q55.text": "Чат-бот дал тебе отличную цитату для эссе со ссылкой на источник. Что сделать, прежде чем её использовать?",
        "quiz.q55.o1": "Открыть источник и проверить, что цитата там действительно есть",
        "quiz.q55.o2": "Ничего: цитату со ссылкой уже точно кто-то проверил",
        "quiz.q55.o3": "Спросить чат-бот, уверен ли он, и поверить его ответу",
        "quiz.q55.o4": "Поменять пару слов, чтобы никто не понял, откуда она",
        "quiz.q55.explain": "Чат-боты иногда выдумывают цитаты и даже источники. Открой ссылку и проверь, что источник существует и в нём действительно так написано. Спросить чат-бот «ты уверен?» — это не проверка: он может просто снова ответить уверенно.",

        "quiz.q56.text": "Задача по математике никак не решается. Как лучше всего воспользоваться ИИ?",
        "quiz.q56.o1": "Попросить подсказку или метод, а решить самостоятельно",
        "quiz.q56.o2": "Попросить готовый ответ и переписать его в тетрадь",
        "quiz.q56.o3": "Поручить ему всю домашку, чтобы осталось время на тренировки",
        "quiz.q56.o4": "Никогда им не пользоваться: ИИ всегда ошибается в математике",
        "quiz.q56.explain": "Пользуйся ИИ как репетитором, а не как тем, кто всё сделает за тебя: подсказка или объяснение помогают учиться, а думать продолжаешь ты. Списанный ответ ничему не учит и часто нарушает школьные правила. И ИИ не всегда ошибается в математике, но может ошибиться, так что проверяй и его шаги.",

        "quiz.q57.text": "Если чат-бот очень уверенно отвечает, его ответ почти наверняка правильный.",
        "quiz.q57.explain": "Неверно. Чат-боты выбирают вероятные слова, а не проверенные факты, поэтому звучат так же уверенно, когда ошибаются. Замечай, когда ответ звучит слишком уверенно, и проверяй важное в надёжных источниках."
    }
});

// ----- The history of AI (the timeline) -----
window.AICompass.addTranslations({
    en: {
        "quiz.q10.text": "Which scientist asked “Can machines think?” in a famous 1950 paper and suggested a test that is now named after him?",
        "quiz.q10.o1": "Alan Turing",
        "quiz.q10.o2": "Ada Lovelace",
        "quiz.q10.o3": "John McCarthy",
        "quiz.q10.o4": "Charles Babbage",
        "quiz.q10.explain": "In 1950 the British mathematician Alan Turing described the “imitation game”, now known as the Turing test: can a machine chat so well that you can't tell it apart from a human? The others are pioneers too: Babbage and Lovelace worked on early computer ideas in the 1800s, and McCarthy gave AI its name in the 1950s.",

        "quiz.q11.text": "IBM's computer Deep Blue beat world chess champion Garry Kasparov in 1997, 25 years before ChatGPT was released in 2022.",
        "quiz.q11.explain": "True. Deep Blue won their six-game match in 1997. It mostly relied on raw computing power, checking about 200 million chess positions per second. ChatGPT, released in November 2022, works very differently: it learned from huge amounts of text.",

        "quiz.q58.text": "The 1956 workshop at Dartmouth College is often called the birth of AI. What did its organisers give the new field?",
        "quiz.q58.o1": "Its name: “artificial intelligence”",
        "quiz.q58.o2": "Its first chatbot, ELIZA",
        "quiz.q58.o3": "Its first robot that could walk",
        "quiz.q58.o4": "Its first program to beat a chess champion",
        "quiz.q58.explain": "John McCarthy and his colleagues used the term “artificial intelligence” in their 1955 proposal for the workshop, and the name stuck. ELIZA came ten years later, in 1966, and a computer beat the world chess champion only in 1997.",

        "quiz.q59.text": "In 2012, a neural network called AlexNet won a big photo-recognition contest by a wide margin. Why was that a turning point?",
        "quiz.q59.o1": "It helped start the deep learning boom",
        "quiz.q59.o2": "It was the first program that could see colour",
        "quiz.q59.o3": "It was the first AI that people could talk to",
        "quiz.q59.o4": "It showed AI no longer needs training data",
        "quiz.q59.explain": "AlexNet, a convolutional neural network trained on graphics cards (GPUs), beat the other entries of the ImageNet contest, which sorts photos into 1,000 categories, by a wide margin. Soon researchers and companies everywhere switched to deep learning. It still needed lots of labelled data: over a million photos.",

        "quiz.q60.text": "ELIZA, a chatbot made in the 1960s, really understood what people told it.",
        "quiz.q60.explain": "False. ELIZA followed simple rules: it spotted key words and turned your words into a question, so it could answer “I feel sad” with something like “Why do you feel sad?”. It understood nothing, yet many people felt understood, which is still a good warning about chatbots today."
    },
    ru: {
        "quiz.q10.text": "Какой учёный в знаменитой статье 1950 года задал вопрос «Могут ли машины мыслить?» и предложил тест, который теперь носит его имя?",
        "quiz.q10.o1": "Алан Тьюринг",
        "quiz.q10.o2": "Ада Лавлейс",
        "quiz.q10.o3": "Джон Маккарти",
        "quiz.q10.o4": "Чарльз Бэббидж",
        "quiz.q10.explain": "В 1950 году британский математик Алан Тьюринг описал «игру в имитацию» — теперь её называют тестом Тьюринга: сможет ли машина общаться так, что её не отличить от человека? Остальные — тоже пионеры: Бэббидж и Лавлейс работали над идеей компьютера ещё в XIX веке, а Маккарти в 1950-х дал ИИ его название.",

        "quiz.q11.text": "Компьютер Deep Blue от IBM обыграл чемпиона мира по шахматам Гарри Каспарова в 1997 году — за 25 лет до выхода ChatGPT в 2022 году.",
        "quiz.q11.explain": "Верно. Deep Blue выиграл матч из шести партий в 1997 году. Он брал в основном вычислительной мощью: перебирал около 200 миллионов шахматных позиций в секунду. ChatGPT, вышедший в ноябре 2022 года, устроен совсем иначе: он учился на огромном количестве текстов.",

        "quiz.q58.text": "Семинар 1956 года в Дартмутском колледже часто называют рождением ИИ. Что его организаторы дали новой области науки?",
        "quiz.q58.o1": "Название — «искусственный интеллект»",
        "quiz.q58.o2": "Первого чат-бота, ELIZA",
        "quiz.q58.o3": "Первого шагающего робота",
        "quiz.q58.o4": "Первую программу, обыгравшую чемпиона по шахматам",
        "quiz.q58.explain": "Джон Маккарти и его коллеги использовали слова «искусственный интеллект» в заявке на семинар в 1955 году, и название прижилось. ELIZA появилась через десять лет, в 1966 году, а чемпиона мира по шахматам компьютер обыграл только в 1997-м.",

        "quiz.q59.text": "В 2012 году нейросеть AlexNet с большим отрывом выиграла крупный конкурс по распознаванию фотографий. Почему это стало поворотным моментом?",
        "quiz.q59.o1": "Она помогла начать бум глубокого обучения",
        "quiz.q59.o2": "Это была первая программа, различающая цвета",
        "quiz.q59.o3": "Это был первый ИИ, с которым можно поговорить",
        "quiz.q59.o4": "Она доказала, что ИИ больше не нужны данные",
        "quiz.q59.explain": "AlexNet — свёрточная нейросеть, обученная на видеокартах (GPU), — с большим отрывом обошла остальных участников конкурса ImageNet, где фото нужно разложить по 1000 категориям. Вскоре исследователи и компании по всему миру перешли на глубокое обучение. Но и ей было нужно много размеченных данных — больше миллиона фотографий.",

        "quiz.q60.text": "ELIZA, чат-бот 1960-х годов, действительно понимала, что ей говорили люди.",
        "quiz.q60.explain": "Неверно. ELIZA следовала простым правилам: находила ключевые слова и превращала твою фразу в вопрос — например, на «мне грустно» могла ответить что-то вроде «Почему тебе грустно?». Она ничего не понимала, но многим людям казалось, что их понимают, — и это до сих пор хорошее предупреждение насчёт чат-ботов."
    }
});

// ----- "Myth or fact": short statements, one per line in the game -----
// Whether each one is a myth or a fact is in js/content/quiz.js ("myths").
window.AICompass.addTranslations({
    en: {
        "quiz.m1.text": "AI thinks and has feelings, just like a person.",
        "quiz.m1.explain": "Today's AI finds patterns in data and has no thoughts or feelings, even when its words sound warm and friendly.",
        "quiz.m2.text": "A model can score perfectly on its training examples and still fail on new ones.",
        "quiz.m2.explain": "That's overfitting: it memorised its examples instead of learning the pattern, which is why models are always tested on data they have never seen.",
        "quiz.m3.text": "An artificial neuron mostly just multiplies numbers and adds them up.",
        "quiz.m3.explain": "It multiplies each input by a weight, adds everything up and passes the result on: the power comes from connecting millions of them.",
        "quiz.m4.text": "Programmers set every weight of a neural network by hand.",
        "quiz.m4.explain": "Big networks have billions of weights: training finds them, starting from random numbers and nudging each one little by little.",
        "quiz.m5.text": "Generative AI can create music and video, not just text and pictures.",
        "quiz.m5.explain": "Generative models learn the patterns of their examples and make new ones: text, images, music, voices, code and video.",
        "quiz.m6.text": "Copying a chatbot's answer into your homework is a quick way to learn the topic.",
        "quiz.m6.explain": "You skip the thinking that makes you learn, and it's often against school rules: ask for an explanation instead.",
        "quiz.m7.text": "Banks use AI to spot unusual payments that might be fraud.",
        "quiz.m7.explain": "It learns what normal payments look like and flags the ones that don't fit.",
        "quiz.m8.text": "Your video feed is designed to show you the most important videos of the day.",
        "quiz.m8.explain": "It's designed to keep you watching, so it shows what you're likely to click, which can trap you in a filter bubble.",
        "quiz.m9.text": "If a video looks completely real, it must be real.",
        "quiz.m9.explain": "Deepfakes can look and sound real, so check who posted it and whether trusted sources report it.",
        "quiz.m10.text": "An AI can pick up unfair habits from the data it learns from.",
        "quiz.m10.explain": "AI copies the patterns in its data, including people's unfairness: this is called bias.",
        "quiz.m11.text": "To a computer, each pixel of a colour photo is three numbers.",
        "quiz.m11.explain": "They say how much red, green and blue light the pixel has (RGB).",
        "quiz.m12.text": "A vision model understands what a cat is, the way you do.",
        "quiz.m12.explain": "It finds patterns of pixels that often come with the label “cat”: patterns, not meaning, which is why odd pictures can fool it.",
        "quiz.m13.text": "An agent can learn to play a video game from nothing but the screen and the score.",
        "quiz.m13.explain": "Researchers trained agents on dozens of classic Atari games this way: the reward is simply the score.",
        "quiz.m14.text": "If an agent gets a high reward, it has done what its designers wanted.",
        "quiz.m14.explain": "An agent chases the reward, not what people meant, and may find a loophole in it: that's reward hacking.",
        "quiz.m15.text": "A chatbot remembers every word of a conversation, however long it gets.",
        "quiz.m15.explain": "It can only look back at a limited amount of text, its context window, so in a very long chat it can lose track of the start.",
        "quiz.m16.text": "A chatbot can give a different answer each time you ask it the same question.",
        "quiz.m16.explain": "It picks each next token with a bit of chance, weighted by the probabilities, so the same question can take a different path.",
        "quiz.m17.text": "AI image generators make pictures by gluing together pieces of real photos.",
        "quiz.m17.explain": "A diffusion model starts from noise and removes it step by step, guided by the prompt: it builds a new picture from patterns it learned.",
        "quiz.m18.text": "Some companies ask people to try to make their AI fail on purpose.",
        "quiz.m18.explain": "This is red teaming: testers look for weak spots before the AI is released, and before bad actors find them.",
        "quiz.m19.text": "Telling a chatbot who the answer is for and how it should look usually gets you a better answer.",
        "quiz.m19.explain": "Context and format are ingredients of a good prompt, along with a role, a clear task and an example.",
        "quiz.m20.text": "AI was invented in the 2020s, when ChatGPT came out.",
        "quiz.m20.explain": "AI research began in the 1950s; ChatGPT came out in November 2022, more than 65 years later."
    },
    ru: {
        "quiz.m1.text": "ИИ думает и чувствует, совсем как человек.",
        "quiz.m1.explain": "Современный ИИ находит закономерности в данных, и у него нет ни мыслей, ни чувств, даже если его слова звучат тепло и дружелюбно.",
        "quiz.m2.text": "Модель может идеально справляться с обучающими примерами и всё равно ошибаться на новых.",
        "quiz.m2.explain": "Это переобучение: модель запомнила примеры, а не закономерность, — поэтому модели всегда проверяют на данных, которых они не видели.",
        "quiz.m3.text": "Искусственный нейрон в основном просто умножает и складывает числа.",
        "quiz.m3.explain": "Он умножает каждый вход на вес, всё складывает и передаёт результат дальше, а вся сила — в том, что таких нейронов соединяют миллионы.",
        "quiz.m4.text": "Программисты вручную задают каждый вес нейросети.",
        "quiz.m4.explain": "У больших сетей миллиарды весов: их находит обучение, которое начинает со случайных чисел и понемногу подправляет каждый вес.",
        "quiz.m5.text": "Генеративный ИИ умеет создавать музыку и видео, а не только тексты и картинки.",
        "quiz.m5.explain": "Генеративные модели изучают закономерности в примерах и создают новое: тексты, изображения, музыку, голоса, код и видео.",
        "quiz.m6.text": "Переписать в домашку ответ чат-бота — быстрый способ разобраться в теме.",
        "quiz.m6.explain": "Так ты пропускаешь то самое обдумывание, благодаря которому учишься, да и школьные правила это часто запрещают: лучше попроси объяснение.",
        "quiz.m7.text": "Банки используют ИИ, чтобы замечать необычные платежи, похожие на мошенничество.",
        "quiz.m7.explain": "ИИ узнаёт, как выглядят обычные платежи, и отмечает те, что выбиваются из привычной картины.",
        "quiz.m8.text": "Лента видео устроена так, чтобы показывать тебе самые важные видео дня.",
        "quiz.m8.explain": "Она устроена так, чтобы как можно дольше удерживать твоё внимание, поэтому показывает то, на что ты, скорее всего, нажмёшь, — и так можно попасть в пузырь фильтров.",
        "quiz.m9.text": "Если видео выглядит совершенно настоящим, значит, оно настоящее.",
        "quiz.m9.explain": "Дипфейки могут выглядеть и звучать как настоящие, поэтому проверяй, кто выложил видео и пишут ли о нём надёжные источники.",
        "quiz.m10.text": "ИИ может перенять несправедливость из данных, на которых учится.",
        "quiz.m10.explain": "ИИ копирует закономерности из данных, в том числе человеческую несправедливость, — это называют предвзятостью.",
        "quiz.m11.text": "Для компьютера каждый пиксель цветной фотографии — это три числа.",
        "quiz.m11.explain": "Они говорят, сколько в пикселе красного, зелёного и синего света (RGB).",
        "quiz.m12.text": "Модель компьютерного зрения понимает, что такое кошка, так же, как ты.",
        "quiz.m12.explain": "Она находит узоры из пикселей, которые часто встречаются с меткой «кошка»: закономерности, а не смысл, — поэтому необычные картинки могут её обмануть.",
        "quiz.m13.text": "Агент может научиться играть в видеоигру, видя только экран и счёт.",
        "quiz.m13.explain": "Так исследователи обучали агентов десяткам классических игр Atari: наградой служит просто счёт.",
        "quiz.m14.text": "Если агент получил большую награду, значит, он сделал то, чего хотели разработчики.",
        "quiz.m14.explain": "Агент гонится за наградой, а не за тем, что имели в виду люди, и может найти в ней лазейку, — это называют взломом награды.",
        "quiz.m15.text": "Чат-бот помнит каждое слово разговора, каким бы длинным он ни был.",
        "quiz.m15.explain": "Он может оглянуться только на ограниченный объём текста — контекстное окно, — поэтому в очень длинном разговоре может потерять из виду начало.",
        "quiz.m16.text": "Чат-бот может давать разные ответы на один и тот же вопрос.",
        "quiz.m16.explain": "Каждый следующий токен он выбирает с долей случайности, с учётом вероятностей, поэтому один и тот же вопрос может пойти по другому пути.",
        "quiz.m17.text": "ИИ-генераторы картинок склеивают изображения из кусочков настоящих фотографий.",
        "quiz.m17.explain": "Диффузионная модель начинает с шума и убирает его шаг за шагом, следуя запросу: она строит новую картинку по выученным закономерностям.",
        "quiz.m18.text": "Некоторые компании просят людей специально пытаться сломать их ИИ.",
        "quiz.m18.explain": "Это ред-тиминг: тестировщики ищут слабые места до выпуска ИИ — и раньше злоумышленников.",
        "quiz.m19.text": "Если сказать чат-боту, для кого ответ и как он должен выглядеть, ответ обычно получается лучше.",
        "quiz.m19.explain": "Контекст и формат — части хорошего промпта, вместе с ролью, понятной задачей и примером.",
        "quiz.m20.text": "ИИ изобрели в 2020-х, когда вышел ChatGPT.",
        "quiz.m20.explain": "Исследования ИИ начались в 1950-х, а ChatGPT вышел в ноябре 2022 года — больше чем через 65 лет."
    }
});
