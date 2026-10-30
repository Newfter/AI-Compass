/* =========================================================
   AI COMPASS — TEXTS: HISTORY TIMELINE
   Every word in English and in Russian (informal "ты"), and at the
   end the eras, the themes and the milestones themselves (icons,
   years, glossary terms, lessons and lab experiments).
   Used by js/timeline.js (and the history section of index.html).
   To change a text, change it here (in both languages).
   Every fact here was checked; the list of facts and why they are
   certain is in the report of the "Timeline 2.0" work. Before you
   change a date, a name or a number, check it in two good sources.
   ========================================================= */

// The section's title and subtitle on the page (index.html)
window.AICompass.addTranslations({
    en: {
        "timeline.label": "HOW WE GOT HERE",
        "timeline.title": "A Short History of AI",
        "timeline.subtitle": "From a single question in 1950 to the AI in your pocket today."
    },
    ru: {
        "timeline.label": "КАК МЫ К ЭТОМУ ПРИШЛИ",
        "timeline.title": "Краткая история ИИ",
        "timeline.subtitle": "От одного вопроса в 1950 году до ИИ в твоём кармане."
    }
});

// The bar, the filters, the buttons and the messages
window.AICompass.addTranslations({
    en: {
        "timeline.filterLabel": "Filter the timeline by era",
        "timeline.era.all": "All",
        "timeline.era.early": "Early ideas",
        "timeline.era.early.num": "Era 01",
        "timeline.era.early.range": "1950 – 1972",
        "timeline.era.early.desc": "Big questions, first programs and huge hopes.",
        "timeline.era.ups": "Ups & downs",
        "timeline.era.ups.num": "Era 02",
        "timeline.era.ups.range": "1970s – 2011",
        "timeline.era.ups.desc": "Hype and funding cuts, famous wins, and the quiet work that prepared a comeback.",
        "timeline.era.deep": "Deep learning",
        "timeline.era.deep.num": "Era 03",
        "timeline.era.deep.range": "2012 – 2020",
        "timeline.era.deep.desc": "Neural networks, big data and fast chips change everything.",
        "timeline.era.gen": "Generative AI",
        "timeline.era.gen.num": "Era 04",
        "timeline.era.gen.range": "2022 – today",
        "timeline.era.gen.desc": "AI that writes, draws and talks — now in everyone's hands.",

        "timeline.themeLabel": "Filter the timeline by theme",
        "timeline.themesTitle": "Themes:",
        "timeline.theme.all": "All themes",
        "timeline.theme.learning": "Learning",
        "timeline.theme.games": "Games",
        "timeline.theme.language": "Language",
        "timeline.theme.images": "Images",
        "timeline.theme.robots": "Robots",
        "timeline.theme.science": "Science",
        "timeline.theme.society": "Society",
        "timeline.themeClear": "Show all themes (now: {theme})",
        "timeline.empty": "No milestones match both filters.",
        "timeline.clearFilters": "Clear the filters",

        "timeline.why": "Why it mattered",
        "timeline.whyNow": "Why it matters",
        "timeline.inGlossary": "In the glossary:",
        "timeline.openTerm": "Open “{term}” in the glossary",
        "timeline.learnMore": "Learn more:",
        "timeline.lessonLink": "Lesson {n}: {title}",
        "timeline.labLink": "AI Lab: {title}",
        "timeline.labLinkPlain": "Try it in the AI Lab",
        "timeline.openAll.one": "Open all {n}",
        "timeline.openAll.many": "Open all {n}",
        "timeline.openAllLabel.one": "Open {n} milestone of the era “{era}”",
        "timeline.openAllLabel.many": "Open all {n} milestones of the era “{era}”",
        "timeline.foldAll": "Main ones only",
        "timeline.foldAllLabel": "Main ones only: fold the extra milestones of the era “{era}”",
        "timeline.showing.one": "Showing {n} milestone",
        "timeline.showing.many": "Showing {n} milestones",

        "timeline.e1.year": "1950",
        "timeline.e1.title": "Alan Turing asks: “Can machines think?”",
        "timeline.e1.text": "In his paper “Computing Machinery and Intelligence”, the British mathematician Alan Turing proposed the “imitation game”: a judge chats by typed messages with a person and with a machine. If the judge can't tell which is which, perhaps the machine should count as intelligent.",
        "timeline.e1.why": "It turned a big philosophical question into a test you could actually run, known today as the Turing test.",

        "timeline.e2.year": "1956",
        "timeline.e2.title": "The Dartmouth workshop gives AI its name",
        "timeline.e2.text": "In the summer of 1956, scientists met at Dartmouth College in the USA for a workshop. The plan for it, written by John McCarthy, Marvin Minsky, Claude Shannon and Nathaniel Rochester, used a new name for the field: “artificial intelligence”.",
        "timeline.e2.why": "AI became a field of research with its own name — and with very big hopes about how quickly it would succeed.",

        "timeline.e3.year": "1958",
        "timeline.e3.title": "The perceptron: a machine that learns",
        "timeline.e3.text": "Psychologist Frank Rosenblatt introduced the perceptron, one of the first artificial neural networks. It learned to recognise simple patterns by adjusting its weights after every mistake. A later machine version, the Mark I Perceptron, looked at pictures through a “camera” of 400 light sensors.",
        "timeline.e3.why": "It showed that a machine could learn from examples instead of following fixed rules, the idea behind today's neural networks.",

        "timeline.e16.year": "1959",
        "timeline.e16.title": "Machine learning gets its name",
        "timeline.e16.text": "At IBM, Arthur Samuel wrote a program that played checkers (draughts) and got better by playing game after game against a copy of itself. In a 1959 paper he called this “machine learning”, and he reported that the program had learned to play better than he did.",
        "timeline.e16.why": "It gave the field a name and an idea that still drives AI: instead of programming every move, let the computer learn from experience.",

        "timeline.e4.year": "1966",
        "timeline.e4.title": "ELIZA, one of the first chatbots",
        "timeline.e4.text": "At MIT, Joseph Weizenbaum created ELIZA, a program that chatted like a therapist using simple rules: it spotted key words in what you typed and turned your own words back into questions.",
        "timeline.e4.why": "Many people felt that ELIZA understood them although it understood nothing, and this “ELIZA effect” is worth remembering when you talk to chatbots today.",

        "timeline.e17.year": "1966–72",
        "timeline.e17.title": "Shakey, a robot that plans its own moves",
        "timeline.e17.text": "At the Stanford Research Institute (SRI) in California, a team built Shakey, a robot on wheels with a TV camera. Given a task such as pushing a box into another room, it looked around, made a plan and carried it out step by step. It got its name because it shook as it moved.",
        "timeline.e17.why": "Methods invented for Shakey, such as the A* route-finding search, are still used in robots and video games today.",

        "timeline.e5.year": "1970s–80s",
        "timeline.e5.title": "The “AI winters”",
        "timeline.e5.text": "Early AI promised too much, too soon, and computers were still slow and expensive. When the results disappointed, money for research dried up: in Britain, a 1973 report for the government judged that AI had not kept its promises. A second “winter” came in the late 1980s, when the boom in expert systems ended.",
        "timeline.e5.why": "It is a lesson about hype: big promises that aren't kept can freeze progress for years.",

        "timeline.e18.year": "1980s",
        "timeline.e18.title": "Expert systems: knowledge as rules",
        "timeline.e18.text": "Expert systems stored the know-how of human specialists as hundreds or thousands of “if … then …” rules. MYCIN, built at Stanford University in the 1970s, used such rules to suggest treatments for blood infections. In the 1980s, expert systems became big business.",
        "timeline.e18.why": "They brought AI into companies, but hand-written rules were costly to keep up to date and broke on unusual cases, one reason why AI later turned to learning from data.",

        "timeline.e19.year": "1986",
        "timeline.e19.title": "Neural networks learn from their mistakes",
        "timeline.e19.text": "David Rumelhart, Geoffrey Hinton and Ronald Williams showed how a neural network with several layers can learn. After each answer, a method called backpropagation works out how much every connection added to the error and adjusts it a little. The idea was older, but their 1986 paper made it famous.",
        "timeline.e19.why": "Backpropagation is still how almost every neural network is trained today.",

        "timeline.e20.year": "1989",
        "timeline.e20.title": "A neural network learns to read handwriting",
        "timeline.e20.text": "At Bell Labs in the USA, Yann LeCun and his colleagues trained a convolutional neural network to read handwritten digits, such as ZIP codes (postcodes) on letters. Nobody wrote rules for it: it learned from thousands of examples which shapes make a 3 or a 7. In the 1990s, banks used later versions (LeNet) to read handwritten numbers on cheques.",
        "timeline.e20.why": "It proved that neural networks could do a real everyday job, and its design is the ancestor of the networks that recognise faces and objects in photos today.",

        "timeline.e6.year": "1997",
        "timeline.e6.title": "Deep Blue beats the world chess champion",
        "timeline.e6.text": "IBM's computer Deep Blue beat Garry Kasparov in a six-game match, 3½–2½. It didn't learn the way modern AI does: special chess chips let it check about 200 million positions every second.",
        "timeline.e6.why": "For the first time, a computer beat the reigning world champion in a match under tournament conditions, showing what raw computing power could do.",

        "timeline.e21.year": "2005",
        "timeline.e21.title": "A robot car crosses the desert on its own",
        "timeline.e21.text": "In a race organised by DARPA, a research agency of the US Department of Defense, robot cars had to drive themselves across the desert with nobody inside. In 2004, none of them reached the finish. In 2005, five did, and Stanley from Stanford University won: it drove the 212-kilometre course faster than all the others.",
        "timeline.e21.why": "It started the race to build self-driving cars, and by 2025 taxis with no driver were carrying passengers in several cities.",

        "timeline.e22.year": "2009",
        "timeline.e22.title": "ImageNet: millions of labelled photos",
        "timeline.e22.text": "Fei-Fei Li and her team presented ImageNet, a huge collection of photos, each labelled by people working online with what it shows. It grew to more than 14 million images in over 20,000 categories, from strawberries to sports cars. From 2010, a yearly contest used it to find out which program recognised pictures best.",
        "timeline.e22.why": "It showed how much good data AI needs to learn, and its contest became the stage where deep learning made its breakthrough in 2012.",

        "timeline.e7.year": "2011",
        "timeline.e7.title": "Watson wins Jeopardy!, and Siri arrives",
        "timeline.e7.text": "IBM's Watson beat two of the best champions of the TV quiz show Jeopardy!, answering tricky questions asked in everyday English. In the same year, Apple built the voice assistant Siri into the iPhone 4S. Siri wasn't the first voice assistant, but it put one into millions of pockets.",
        "timeline.e7.why": "Computers were getting much better at understanding everyday language, and AI started moving into people's pockets.",

        "timeline.e8.year": "2012",
        "timeline.e8.title": "AlexNet starts the deep-learning boom",
        "timeline.e8.text": "A deep neural network called AlexNet, built by Alex Krizhevsky, Ilya Sutskever and Geoffrey Hinton, won the ImageNet image-recognition contest by a huge margin: about 15% errors, against 26% for the next best entry. It was trained on graphics cards (GPUs) — chips first made for video games.",
        "timeline.e8.why": "It proved that big neural networks, lots of data and fast chips really work together, and within a few years deep learning was everywhere: in photos, speech and translation.",

        "timeline.e23.year": "2013",
        "timeline.e23.title": "word2vec turns words into numbers",
        "timeline.e23.text": "A team at Google led by Tomas Mikolov released word2vec, a method that turns every word into a list of numbers, learned from billions of words of text. Words used in similar ways get similar numbers, and you can even do maths with meaning: “king” − “man” + “woman” lands close to “queen”.",
        "timeline.e23.why": "Numbers that capture the meaning of words, called embeddings, became a basic building block of today's language models.",

        "timeline.e9.year": "2014",
        "timeline.e9.title": "GANs: AI learns to create images",
        "timeline.e9.text": "Ian Goodfellow and his colleagues invented generative adversarial networks (GANs). Two neural networks compete like a forger and a detective: one makes fake images, the other tries to spot the fakes, and both keep getting better.",
        "timeline.e9.why": "Computers began to create realistic new pictures, which paved the way for today's generative AI — and also for deepfakes.",

        "timeline.e10.year": "2016",
        "timeline.e10.title": "AlphaGo beats Lee Sedol at Go",
        "timeline.e10.text": "DeepMind's AlphaGo beat Lee Sedol, one of the world's best Go players, 4–1 in Seoul. Go has more possible board positions than there are atoms in the observable universe, so simply checking every move could never work.",
        "timeline.e10.why": "Learning first from human games and then by playing against itself (reinforcement learning), AlphaGo found new ideas, like its famous “Move 37”, that surprised even top players.",

        "timeline.e11.year": "2017",
        "timeline.e11.title": "The Transformer: “Attention Is All You Need”",
        "timeline.e11.text": "Researchers at Google published a paper that introduced the Transformer, a new neural network design. It uses “attention” to look at all the words of a text at once and work out how they relate to each other.",
        "timeline.e11.why": "Transformers became the basis of almost every modern language model: the “T” in GPT stands for Transformer.",

        "timeline.e24.year": "2018",
        "timeline.e24.title": "Gender Shades: AI that isn't equally accurate for everyone",
        "timeline.e24.text": "Researchers Joy Buolamwini and Timnit Gebru tested commercial AI systems that guess a person's gender from a photo. For lighter-skinned men they were wrong at most 0.8% of the time, but for darker-skinned women up to 34.7% of the time. The face collections used to test such systems showed mostly lighter-skinned people, so the problem had gone unnoticed.",
        "timeline.e24.why": "It showed why AI must be tested on different groups of people, not just on average, and the companies soon improved their systems.",

        "timeline.e25.year": "2020",
        "timeline.e25.title": "GPT-3: a giant language model",
        "timeline.e25.text": "OpenAI introduced GPT-3, a language model with 175 billion parameters, trained to predict the next word on huge amounts of text from the internet and books. With no extra training it could write stories, answer questions, translate or write simple code, just from a few examples in the prompt.",
        "timeline.e25.why": "It showed that making language models much bigger made them surprisingly capable, which led to ChatGPT two years later.",

        "timeline.e12.year": "2020",
        "timeline.e12.title": "AlphaFold 2: a breakthrough in biology",
        "timeline.e12.text": "At the CASP14 science competition, DeepMind's AlphaFold 2 predicted the 3D shapes of proteins from their building blocks, often almost as accurately as lab experiments. Scientists had been working on this problem for about 50 years.",
        "timeline.e12.why": "A protein's shape helps explain how it works and how diseases might be treated, and AlphaFold's free database now holds predicted shapes for over 200 million proteins.",

        "timeline.e26.year": "2022",
        "timeline.e26.title": "Type a sentence, get a picture",
        "timeline.e26.text": "Image generators such as DALL·E 2 and Stable Diffusion turned short descriptions into detailed pictures. They are diffusion models: they start from random noise and remove it step by step until an image that matches the words appears. Stable Diffusion was released openly, so anyone could run it on a good home computer.",
        "timeline.e26.why": "Making pictures became as easy as typing, which raised big questions about artists' work used for training, about copyright and about fake photos.",

        "timeline.e13.year": "2022",
        "timeline.e13.title": "ChatGPT goes public",
        "timeline.e13.text": "On 30 November 2022, OpenAI released ChatGPT, a chatbot built on a large language model and trained with feedback from people to be helpful. According to widely reported estimates, it reached about 100 million users in roughly two months — one of the fastest-growing apps ever.",
        "timeline.e13.why": "Suddenly anyone could talk to AI in plain language, and generative AI became an everyday topic at school, at work and at home.",

        "timeline.e27.year": "2023",
        "timeline.e27.title": "Chatbots learn to see: multimodal AI",
        "timeline.e27.text": "In March 2023, OpenAI released GPT-4, which could take pictures as well as text, for example to describe what is in a photo. Other companies released their own large models, such as Anthropic's Claude and Google's Gemini. Models that handle several kinds of data, like text, images and sound, are called multimodal.",
        "timeline.e27.why": "AI assistants could now help with what you see, not only with what you type — but they still make mistakes, so their answers need checking.",

        "timeline.e28.year": "2024",
        "timeline.e28.title": "The EU adopts the first broad law on AI",
        "timeline.e28.text": "The European Union adopted the AI Act, the first broad law on artificial intelligence. It sorts AI by risk: a few uses are banned, such as scoring people for their behaviour; high-risk uses, like AI that helps decide who gets a job or a loan, must meet strict rules; and people must be told when they are talking to a chatbot.",
        "timeline.e28.why": "For the first time, a large group of countries set binding rules for AI, which come into force step by step over several years.",

        "timeline.e14.year": "2024",
        "timeline.e14.title": "Nobel Prizes for AI pioneers",
        "timeline.e14.text": "The Nobel Prize in Physics went to John Hopfield and Geoffrey Hinton for discoveries that made machine learning with neural networks possible. The Chemistry prize went to Demis Hassabis and John Jumper for AlphaFold, together with David Baker for designing new proteins with computers.",
        "timeline.e14.why": "Science's most famous awards recognised AI both as a field of discovery and as a powerful tool for other sciences.",

        "timeline.e29.year": "2024–25",
        "timeline.e29.title": "AI that reasons step by step, and agents that act",
        "timeline.e29.text": "In September 2024, OpenAI released o1, one of the first “reasoning” models: it was trained to work through a problem step by step before answering, which made it much better at maths and coding. Others, such as DeepSeek-R1, soon followed. AI agents also appeared that can use tools, search the web or click through websites to carry out tasks with many steps.",
        "timeline.e29.why": "AI began to move from answering questions to doing tasks, but it still makes mistakes, so people need to check its work and decide what it is allowed to do.",

        "timeline.e15.year": "Today",
        "timeline.e15.title": "AI in your pocket, your classroom and the lab",
        "timeline.e15.text": "AI now helps to translate languages, edit photos, recommend videos, support doctors and speed up science. Many students use AI chatbots to learn — and the open questions matter as much as the technology.",
        "timeline.e15.why": "Keeping AI fair, safe and honest, and deciding how it should change school and work, is up to people — including you."
    },
    ru: {
        "timeline.filterLabel": "Фильтр хронологии по эпохам",
        "timeline.era.all": "Все",
        "timeline.era.early": "Первые идеи",
        "timeline.era.early.num": "Эпоха 01",
        "timeline.era.early.range": "1950 – 1972",
        "timeline.era.early.desc": "Большие вопросы, первые программы и огромные надежды.",
        "timeline.era.ups": "Взлёты и падения",
        "timeline.era.ups.num": "Эпоха 02",
        "timeline.era.ups.range": "1970-е – 2011",
        "timeline.era.ups.desc": "Хайп и урезанные бюджеты, громкие победы — и тихая работа, которая подготовила возвращение.",
        "timeline.era.deep": "Глубокое обучение",
        "timeline.era.deep.num": "Эпоха 03",
        "timeline.era.deep.range": "2012 – 2020",
        "timeline.era.deep.desc": "Нейросети, большие данные и быстрые чипы меняют всё.",
        "timeline.era.gen": "Генеративный ИИ",
        "timeline.era.gen.num": "Эпоха 04",
        "timeline.era.gen.range": "2022 – сегодня",
        "timeline.era.gen.desc": "ИИ, который пишет, рисует и разговаривает, — теперь доступен каждому.",

        "timeline.themeLabel": "Фильтр хронологии по темам",
        "timeline.themesTitle": "Темы:",
        "timeline.theme.all": "Все темы",
        "timeline.theme.learning": "Обучение",
        "timeline.theme.games": "Игры",
        "timeline.theme.language": "Язык",
        "timeline.theme.images": "Изображения",
        "timeline.theme.robots": "Роботы",
        "timeline.theme.science": "Наука",
        "timeline.theme.society": "Общество",
        "timeline.themeClear": "Показать все темы (сейчас: {theme})",
        "timeline.empty": "Нет событий, которые подходят под оба фильтра.",
        "timeline.clearFilters": "Сбросить фильтры",

        "timeline.why": "Почему это было важно",
        "timeline.whyNow": "Почему это важно",
        "timeline.inGlossary": "В словаре:",
        "timeline.openTerm": "Открыть «{term}» в словаре",
        "timeline.learnMore": "Узнать больше:",
        "timeline.lessonLink": "Урок {n}: {title}",
        "timeline.labLink": "ИИ-лаборатория: {title}",
        "timeline.labLinkPlain": "Попробовать в ИИ-лаборатории",
        "timeline.openAll.one": "Раскрыть все {n}",
        "timeline.openAll.few": "Раскрыть все {n}",
        "timeline.openAll.many": "Раскрыть все {n}",
        "timeline.openAllLabel.one": "Раскрыть все {n} событие эпохи «{era}»",
        "timeline.openAllLabel.few": "Раскрыть все {n} события эпохи «{era}»",
        "timeline.openAllLabel.many": "Раскрыть все {n} событий эпохи «{era}»",
        "timeline.foldAll": "Только главные",
        "timeline.foldAllLabel": "Только главные: свернуть дополнительные события эпохи «{era}»",
        "timeline.showing.one": "Показано {n} событие",
        "timeline.showing.few": "Показано {n} события",
        "timeline.showing.many": "Показано {n} событий",

        "timeline.e1.year": "1950",
        "timeline.e1.title": "Алан Тьюринг спрашивает: «Могут ли машины мыслить?»",
        "timeline.e1.text": "В статье «Вычислительные машины и разум» британский математик Алан Тьюринг предложил «игру в имитацию»: судья переписывается с человеком и с машиной. Если судья не может понять, кто есть кто, возможно, машину стоит считать разумной.",
        "timeline.e1.why": "Большой философский вопрос превратился в проверку, которую можно провести на деле, — сегодня её называют тестом Тьюринга.",

        "timeline.e2.year": "1956",
        "timeline.e2.title": "Дартмутский семинар: у ИИ появляется имя",
        "timeline.e2.text": "Летом 1956 года учёные собрались на семинар в Дартмутском колледже (США). В его плане, который написали Джон Маккарти, Марвин Минский, Клод Шеннон и Натаниэль Рочестер, появилось новое название области — «искусственный интеллект».",
        "timeline.e2.why": "ИИ стал отдельной областью науки со своим именем — и с очень большими надеждами на быстрый успех.",

        "timeline.e3.year": "1958",
        "timeline.e3.title": "Перцептрон: машина, которая учится",
        "timeline.e3.text": "Психолог Фрэнк Розенблатт представил перцептрон — одну из первых искусственных нейронных сетей. Он учился узнавать простые образы, подправляя свои веса после каждой ошибки. Позже машина Mark I Perceptron смотрела на картинки через «камеру» из 400 световых датчиков.",
        "timeline.e3.why": "Он показал, что машина может учиться на примерах, а не следовать жёстким правилам, — на этой идее построены современные нейросети.",

        "timeline.e16.year": "1959",
        "timeline.e16.title": "У машинного обучения появляется имя",
        "timeline.e16.text": "В IBM Артур Сэмюэл написал программу для игры в шашки, которая становилась сильнее, играя партию за партией против копии самой себя. В статье 1959 года он назвал это «машинным обучением» и сообщил, что программа научилась играть лучше, чем он сам.",
        "timeline.e16.why": "Область получила имя и идею, которая движет ИИ до сих пор: не программировать каждый ход, а дать компьютеру учиться на опыте.",

        "timeline.e4.year": "1966",
        "timeline.e4.title": "ELIZA — один из первых чат-ботов",
        "timeline.e4.text": "В MIT Джозеф Вейценбаум создал ELIZA — программу, которая беседовала как психотерапевт по простым правилам: находила ключевые слова в том, что ты написал, и превращала твои же слова в вопросы.",
        "timeline.e4.why": "Многим казалось, что ELIZA их понимает, хотя она не понимала ничего, — об этом «эффекте ELIZA» полезно помнить и сегодня, когда общаешься с чат-ботами.",

        "timeline.e17.year": "1966–72",
        "timeline.e17.title": "Шейки — робот, который сам планирует свои действия",
        "timeline.e17.text": "В Стэнфордском исследовательском институте (SRI) в Калифорнии построили Шейки — робота на колёсах с телекамерой. Получив задачу, например передвинуть коробку в другую комнату, он осматривался, составлял план и выполнял его шаг за шагом. Его назвали Shakey («шаткий»), потому что он покачивался на ходу.",
        "timeline.e17.why": "Методы, придуманные для Шейки, например поиск пути A*, до сих пор используют в роботах и видеоиграх.",

        "timeline.e5.year": "1970–80-е",
        "timeline.e5.title": "«Зимы» искусственного интеллекта",
        "timeline.e5.text": "Первые исследователи ИИ обещали слишком много и слишком быстро, а компьютеры были ещё медленными и дорогими. Когда результаты разочаровали, деньги на исследования закончились: в Великобритании доклад для правительства в 1973 году заключил, что ИИ не оправдал обещаний. Вторая «зима» пришла в конце 1980-х, когда закончился бум экспертных систем.",
        "timeline.e5.why": "Это урок о хайпе: невыполненные громкие обещания могут «заморозить» развитие на годы.",

        "timeline.e18.year": "1980-е",
        "timeline.e18.title": "Экспертные системы: знания в виде правил",
        "timeline.e18.text": "Экспертные системы хранили знания специалистов в виде сотен и тысяч правил «если …, то …». Например, MYCIN, созданная в Стэнфордском университете в 1970-х, по таким правилам предлагала лечение при инфекциях крови. В 1980-х экспертные системы стали большим бизнесом.",
        "timeline.e18.why": "Они привели ИИ в компании, но правила, написанные вручную, было дорого обновлять, и они ломались на необычных случаях, — одна из причин, почему позже ИИ стал учиться на данных.",

        "timeline.e19.year": "1986",
        "timeline.e19.title": "Нейросети учатся на своих ошибках",
        "timeline.e19.text": "Дэвид Румельхарт, Джеффри Хинтон и Рональд Уильямс показали, как учится нейросеть из нескольких слоёв. После каждого ответа метод обратного распространения ошибки вычисляет, насколько каждая связь виновата в ошибке, и немного её подправляет. Сама идея появилась раньше, но знаменитой её сделала их статья 1986 года.",
        "timeline.e19.why": "Почти все нейросети и сегодня обучаются методом обратного распространения ошибки.",

        "timeline.e20.year": "1989",
        "timeline.e20.title": "Нейросеть учится читать почерк",
        "timeline.e20.text": "В Bell Labs (США) Ян Лекун и его коллеги обучили свёрточную нейронную сеть читать рукописные цифры — например, почтовые индексы на конвертах. Правил для неё никто не писал: по тысячам примеров она сама выучила, какие формы означают 3, а какие 7. В 1990-х банки использовали её улучшенные версии (LeNet), чтобы читать рукописные цифры на чеках.",
        "timeline.e20.why": "Она доказала, что нейросети справляются с настоящей повседневной работой, а её устройство — предок сетей, которые сегодня узнают лица и предметы на фотографиях.",

        "timeline.e6.year": "1997",
        "timeline.e6.title": "Deep Blue обыгрывает чемпиона мира по шахматам",
        "timeline.e6.text": "Компьютер Deep Blue от IBM победил Гарри Каспарова в матче из шести партий со счётом 3½:2½. Он не учился, как современный ИИ: специальные шахматные чипы позволяли ему проверять около 200 миллионов позиций в секунду.",
        "timeline.e6.why": "Впервые компьютер выиграл матч у действующего чемпиона мира в турнирных условиях — это показало, на что способна чистая вычислительная мощь.",

        "timeline.e21.year": "2005",
        "timeline.e21.title": "Робот-автомобиль сам пересекает пустыню",
        "timeline.e21.text": "На гонке, которую устроило DARPA — исследовательское агентство Министерства обороны США, — машины-роботы должны были сами, без людей внутри, проехать через пустыню. В 2004 году до финиша не добрался никто. В 2005-м финишировали пять машин, а победил Stanley из Стэнфордского университета: трассу длиной 212 километров он прошёл быстрее всех.",
        "timeline.e21.why": "Это дало старт гонке за беспилотными автомобилями: к 2025 году такси без водителя уже возили пассажиров в нескольких городах.",

        "timeline.e22.year": "2009",
        "timeline.e22.title": "ImageNet: миллионы подписанных фотографий",
        "timeline.e22.text": "Фей-Фей Ли и её команда представили ImageNet — огромную коллекцию фотографий, на каждой из которых люди через интернет подписали, что на ней изображено. Она выросла до более чем 14 миллионов снимков в более чем 20 000 категорий — от клубники до спортивных машин. С 2010 года на ней проводили ежегодный конкурс: чья программа лучше узнаёт изображения.",
        "timeline.e22.why": "Она показала, как много хороших данных нужно ИИ, чтобы учиться, а её конкурс стал сценой, на которой в 2012 году совершило прорыв глубокое обучение.",

        "timeline.e7.year": "2011",
        "timeline.e7.title": "Watson выигрывает Jeopardy!, и появляется Siri",
        "timeline.e7.text": "Система Watson от IBM обыграла двух лучших чемпионов американской телевикторины Jeopardy!, отвечая на хитрые вопросы, заданные обычным языком. В том же году Apple встроила голосового помощника Siri в iPhone 4S. Siri не была первым голосовым помощником, но именно она попала в карманы миллионов людей.",
        "timeline.e7.why": "Компьютеры стали гораздо лучше понимать обычную речь, и ИИ начал перебираться в карманы людей.",

        "timeline.e8.year": "2012",
        "timeline.e8.title": "AlexNet запускает бум глубокого обучения",
        "timeline.e8.text": "Глубокая нейросеть AlexNet, которую создали Алекс Крижевский, Илья Суцкевер и Джеффри Хинтон, с огромным отрывом выиграла конкурс ImageNet по распознаванию изображений: около 15% ошибок против 26% у ближайшего соперника. Её обучали на видеокартах (GPU) — чипах, которые изначально делали для видеоигр.",
        "timeline.e8.why": "Она доказала, что большие нейросети, много данных и быстрые чипы вместе действительно работают, и уже через несколько лет глубокое обучение было повсюду: в фото, распознавании речи и переводе.",

        "timeline.e23.year": "2013",
        "timeline.e23.title": "word2vec превращает слова в числа",
        "timeline.e23.text": "Команда Google во главе с Томашем Миколовым выпустила word2vec — метод, который превращает каждое слово в список чисел, выученный по миллиардам слов текста. У слов, которые употребляют похоже, получаются похожие числа, и со смыслом можно даже считать: «король» − «мужчина» + «женщина» оказывается рядом с «королевой».",
        "timeline.e23.why": "Числа, которые передают смысл слов, — эмбеддинги — стали одним из основных кирпичиков современных языковых моделей.",

        "timeline.e9.year": "2014",
        "timeline.e9.title": "GAN: ИИ учится создавать изображения",
        "timeline.e9.text": "Ян Гудфеллоу и его коллеги придумали генеративно-состязательные сети (GAN). Две нейросети соревнуются, как фальшивомонетчик и сыщик: одна создаёт поддельные картинки, другая пытается их распознать, и обе становятся всё лучше.",
        "timeline.e9.why": "Компьютеры начали создавать реалистичные новые изображения — так открылся путь к современному генеративному ИИ, а заодно и к дипфейкам.",

        "timeline.e10.year": "2016",
        "timeline.e10.title": "AlphaGo обыгрывает Ли Седоля в го",
        "timeline.e10.text": "Программа AlphaGo от DeepMind победила Ли Седоля, одного из лучших игроков в го в мире, со счётом 4:1 в Сеуле. В го возможных позиций больше, чем атомов в наблюдаемой Вселенной, поэтому простым перебором всех ходов тут не победить.",
        "timeline.e10.why": "Обучаясь сначала на партиях людей, а потом играя сама с собой (обучение с подкреплением), AlphaGo нашла новые идеи — например, знаменитый «37-й ход», который удивил даже лучших игроков.",

        "timeline.e11.year": "2017",
        "timeline.e11.title": "Трансформер: «Attention Is All You Need»",
        "timeline.e11.text": "Исследователи из Google опубликовали статью (её название переводится как «Внимание — это всё, что вам нужно»), в которой представили трансформер — новую архитектуру нейросети. С помощью механизма «внимания» она смотрит сразу на все слова текста и выясняет, как они связаны.",
        "timeline.e11.why": "Трансформеры стали основой почти всех современных языковых моделей: буква «T» в GPT означает Transformer.",

        "timeline.e24.year": "2018",
        "timeline.e24.title": "Gender Shades: ИИ ошибается не одинаково для всех",
        "timeline.e24.text": "Исследовательницы Джой Буоламвини и Тимнит Гебру проверили коммерческие ИИ-системы, которые определяют пол человека по фотографии. У светлокожих мужчин они ошибались не больше чем в 0,8% случаев, а у темнокожих женщин — до 34,7%. Наборы лиц, на которых проверяли такие системы, состояли в основном из светлокожих людей, поэтому проблему не замечали.",
        "timeline.e24.why": "Исследование показало, почему ИИ нужно проверять на разных группах людей, а не только «в среднем», и компании вскоре улучшили свои системы.",

        "timeline.e25.year": "2020",
        "timeline.e25.title": "GPT-3: гигантская языковая модель",
        "timeline.e25.text": "OpenAI представила GPT-3 — языковую модель со 175 миллиардами параметров, обученную предсказывать следующее слово на огромном количестве текстов из интернета и книг. Без дополнительного обучения она могла писать рассказы, отвечать на вопросы, переводить и писать простой код — достаточно было показать ей несколько примеров в запросе.",
        "timeline.e25.why": "Она показала, что если сильно увеличить языковую модель, та становится удивительно способной, — через два года это привело к ChatGPT.",

        "timeline.e12.year": "2020",
        "timeline.e12.title": "AlphaFold 2: прорыв в биологии",
        "timeline.e12.text": "На научном конкурсе CASP14 программа AlphaFold 2 от DeepMind предсказывала трёхмерную форму белков по их «строительным блокам» — часто почти так же точно, как лабораторные эксперименты. Над этой задачей учёные бились около 50 лет.",
        "timeline.e12.why": "Форма белка помогает понять, как он работает и как можно лечить болезни, а в бесплатной базе AlphaFold теперь есть предсказанные формы более 200 миллионов белков.",

        "timeline.e26.year": "2022",
        "timeline.e26.title": "Напиши фразу — получи картинку",
        "timeline.e26.text": "Генераторы изображений, такие как DALL·E 2 и Stable Diffusion, превращали короткие описания в подробные картинки. Это диффузионные модели: они начинают со случайного шума и шаг за шагом убирают его, пока не появится изображение, подходящее под слова. Stable Diffusion выложили в открытый доступ, и её мог запустить любой на хорошем домашнем компьютере.",
        "timeline.e26.why": "Создавать картинки стало так же просто, как печатать, и это подняло большие вопросы: о работах художников в обучающих данных, об авторском праве и о фальшивых фото.",

        "timeline.e13.year": "2022",
        "timeline.e13.title": "ChatGPT становится доступен всем",
        "timeline.e13.text": "30 ноября 2022 года OpenAI выпустила ChatGPT — чат-бот на основе большой языковой модели, которого с помощью оценок людей учили быть полезным. По широко цитируемым оценкам, примерно за два месяца у него появилось около 100 миллионов пользователей — это одно из самых быстрорастущих приложений в истории.",
        "timeline.e13.why": "Внезапно любой мог поговорить с ИИ обычным языком, и генеративный ИИ стал повседневной темой в школе, на работе и дома.",

        "timeline.e27.year": "2023",
        "timeline.e27.title": "Чат-боты учатся видеть: мультимодальный ИИ",
        "timeline.e27.text": "В марте 2023 года OpenAI выпустила GPT-4: ей можно было показать не только текст, но и картинку — например, попросить описать, что на фото. Другие компании выпустили свои большие модели, например Claude от Anthropic и Gemini от Google. Модели, которые работают с разными видами данных — текстом, изображениями, звуком, — называют мультимодальными.",
        "timeline.e27.why": "ИИ-помощники теперь могли помочь с тем, что ты видишь, а не только с тем, что печатаешь, — но они всё так же ошибаются, и их ответы нужно проверять.",

        "timeline.e28.year": "2024",
        "timeline.e28.title": "ЕС принимает первый большой закон об ИИ",
        "timeline.e28.text": "Европейский союз принял Закон об ИИ (AI Act) — первый широкий закон об искусственном интеллекте. Он делит ИИ по уровню риска: некоторые применения запрещены, например «социальный рейтинг» людей за их поведение; применения с высоким риском, вроде ИИ, который помогает решать, кого взять на работу или кому дать кредит, должны соответствовать строгим правилам; а людям обязаны сообщать, что они общаются с чат-ботом.",
        "timeline.e28.why": "Впервые большая группа стран ввела обязательные правила для ИИ — они вступают в силу постепенно, в течение нескольких лет.",

        "timeline.e14.year": "2024",
        "timeline.e14.title": "Нобелевские премии пионерам ИИ",
        "timeline.e14.text": "Нобелевскую премию по физике получили Джон Хопфилд и Джеффри Хинтон за открытия, благодаря которым стало возможно машинное обучение с помощью нейросетей. Премию по химии вручили Демису Хассабису и Джону Джамперу за AlphaFold, а также Дэвиду Бейкеру — за создание новых белков с помощью компьютера.",
        "timeline.e14.why": "Самые известные научные награды признали ИИ и отдельной областью открытий, и мощным инструментом для других наук.",

        "timeline.e29.year": "2024–25",
        "timeline.e29.title": "ИИ, который рассуждает по шагам, и агенты, которые действуют",
        "timeline.e29.text": "В сентябре 2024 года OpenAI выпустила o1 — одну из первых «рассуждающих» моделей: её научили разбирать задачу шаг за шагом, прежде чем ответить, и она стала гораздо лучше решать задачи по математике и программированию. Вскоре за ней последовали другие, например DeepSeek-R1. А ИИ-агенты научились пользоваться инструментами, искать в интернете и сами нажимать кнопки на сайтах, чтобы выполнять задачи из многих шагов.",
        "timeline.e29.why": "ИИ начал переходить от ответов на вопросы к выполнению дел, но он по-прежнему ошибается, поэтому людям нужно проверять его работу и решать, что ему можно делать.",

        "timeline.e15.year": "Сегодня",
        "timeline.e15.title": "ИИ в кармане, в классе и в лаборатории",
        "timeline.e15.text": "Сегодня ИИ помогает переводить тексты, обрабатывать фото, подбирать видео, поддерживать врачей и ускорять науку. Многие школьники учатся с помощью чат-ботов, и открытые вопросы важны не меньше самих технологий.",
        "timeline.e15.why": "Сделать ИИ честным, безопасным и справедливым и решить, как он изменит учёбу и работу, — задача людей, в том числе твоя."
    }
});

// The eras, the themes and the milestones
// (js/timeline.js reads them with AICompass.content.get("timeline")).
window.AICompass.content.set("timeline", {
    // The eras, in the order of their chips and on the page. Every era has its
    // texts above: "timeline.era.early", ".num", ".range", ".desc".
    // Other features use these ids (My Compass counts the eras you reached): keep them.
    eras: ["early", "ups", "deep", "gen"],

    // The themes of the second row of chips, in their order there.
    // Every theme has its name above: "timeline.theme.games".
    themes: [
        { id: "learning", icon: "🧠" },
        { id: "games", icon: "🎮" },
        { id: "language", icon: "💬" },
        { id: "images", icon: "🖼️" },
        { id: "robots", icon: "🤖" },
        { id: "science", icon: "🔬" },
        { id: "society", icon: "🌍" }
    ],

    // The milestones, in the order of the page (oldest first). For each one:
    //   key       the start of its texts above ("timeline.e1.year", ".title", ".text", ".why").
    //             A new milestone takes the next free number; the number says nothing about its place.
    //   era       the era it belongs to
    //   icon      the emoji on its dot
    //   datetime  the year for the <time> element ("" when it is not one year, like "1970s–80s")
    //   major     true: always shown in full. The others start folded: a short card with
    //             the year and the title that opens with a click (each era: 3 or 4 major ones)
    //   themes    its themes (ids from "themes" above): it shows when one of them is chosen
    //   terms     glossary terms it links to (ids in js/content/glossary.js). An id the
    //             glossary doesn't have yet is simply left out until it has it.
    //   lesson    the lesson that teaches the idea (left out when there is none). A lesson
    //             the site doesn't have yet (lessons 7-12 of the "Deep dive") is left out too.
    //   lab       the AI Lab experiment to try (left out when there is none)
    //   today     true for the last one ("Why it matters" instead of "Why it mattered")
    events: [
        { key: "e1", era: "early", icon: "🤔", datetime: "1950", major: true, themes: ["language"], terms: ["turing-test"], lesson: 1 },
        { key: "e2", era: "early", icon: "🏫", datetime: "1956", major: true, themes: ["science"], terms: ["ai"], lesson: 1 },
        { key: "e3", era: "early", icon: "🔗", datetime: "1958", major: true, themes: ["learning", "images"], terms: ["neuron", "neural-network"], lesson: 3, lab: "classifier" },
        { key: "e16", era: "early", icon: "🏁", datetime: "1959", themes: ["learning", "games"], terms: ["ml", "training"], lesson: 2 },
        { key: "e4", era: "early", icon: "💬", datetime: "1966", themes: ["language"], terms: ["chatbot", "nlp"], lesson: 4 },
        { key: "e17", era: "early", icon: "🤖", datetime: "", themes: ["robots"], terms: ["robot", "agent"] },

        { key: "e5", era: "ups", icon: "❄️", datetime: "", major: true, themes: ["society"], terms: [] },
        { key: "e18", era: "ups", icon: "🩺", datetime: "", themes: ["science"], terms: ["algorithm"], lesson: 1 },
        { key: "e19", era: "ups", icon: "🔁", datetime: "1986", themes: ["learning"], terms: ["neural-network", "gradient-descent", "loss"], lesson: 3, lab: "descent" },
        { key: "e20", era: "ups", icon: "✍️", datetime: "1989", themes: ["learning", "images"], terms: ["cnn", "computer-vision"], lesson: 7, lab: "vision" },
        { key: "e6", era: "ups", icon: "♟️", datetime: "1997", major: true, themes: ["games"], terms: ["algorithm"], lesson: 1 },
        { key: "e21", era: "ups", icon: "🚗", datetime: "2005", themes: ["robots"], terms: ["robot", "computer-vision"], lesson: 5 },
        { key: "e22", era: "ups", icon: "🏷️", datetime: "2009", major: true, themes: ["images", "learning"], terms: ["dataset", "computer-vision"], lesson: 2 },
        { key: "e7", era: "ups", icon: "🎙️", datetime: "2011", themes: ["language", "games"], terms: ["nlp"], lesson: 5 },

        { key: "e8", era: "deep", icon: "🖼️", datetime: "2012", major: true, themes: ["images", "learning"], terms: ["deep-learning", "cnn", "computer-vision"], lesson: 7, lab: "vision" },
        { key: "e23", era: "deep", icon: "🔢", datetime: "2013", themes: ["language"], terms: ["embedding", "nlp"], lesson: 9, lab: "chatbot" },
        { key: "e9", era: "deep", icon: "🎨", datetime: "2014", themes: ["images"], terms: ["gan", "generative-ai", "deepfake"], lesson: 10 },
        { key: "e10", era: "deep", icon: "⚫", datetime: "2016", major: true, themes: ["games", "learning"], terms: ["reinforcement", "reward"], lesson: 8, lab: "maze" },
        { key: "e11", era: "deep", icon: "⚡", datetime: "2017", major: true, themes: ["language"], terms: ["transformer", "attention"], lesson: 9, lab: "chatbot" },
        { key: "e24", era: "deep", icon: "⚖️", datetime: "2018", themes: ["society", "images"], terms: ["bias", "dataset"], lesson: 11, lab: "bias" },
        { key: "e25", era: "deep", icon: "📝", datetime: "2020", themes: ["language"], terms: ["llm", "parameters", "next-token"], lesson: 9, lab: "predictor" },
        { key: "e12", era: "deep", icon: "🧬", datetime: "2020", themes: ["science"], terms: ["deep-learning"] },

        { key: "e26", era: "gen", icon: "🖌️", datetime: "2022", themes: ["images"], terms: ["diffusion", "generative-ai", "prompt"], lesson: 10 },
        { key: "e13", era: "gen", icon: "🚀", datetime: "2022", major: true, themes: ["language", "society"], terms: ["chatbot", "llm", "rlhf"], lesson: 4, lab: "chatbot" },
        { key: "e27", era: "gen", icon: "📸", datetime: "2023", themes: ["language", "images"], terms: ["llm", "hallucination"], lesson: 9 },
        { key: "e28", era: "gen", icon: "📜", datetime: "2024", major: true, themes: ["society"], terms: ["ai-act"], lesson: 11 },
        { key: "e14", era: "gen", icon: "🏅", datetime: "2024", major: true, themes: ["science"], terms: ["neural-network"], lesson: 3 },
        { key: "e29", era: "gen", icon: "🧠", datetime: "", themes: ["language"], terms: ["agent", "llm"], lesson: 12 },
        { key: "e15", era: "gen", icon: "📱", datetime: "", major: true, themes: ["society", "science"], terms: ["bias", "privacy"], lesson: 6, today: true }
    ]
});
