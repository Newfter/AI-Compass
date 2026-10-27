/* =========================================================
   AI COMPASS — TEXTS: HISTORY TIMELINE
   Every word in English and in Russian (informal "ты").
   Used by js/timeline.js (and the history section of index.html).
   To change a text, change it here (in both languages).
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

window.AICompass.addTranslations({
    en: {
        "timeline.filterLabel": "Filter the timeline by era",
        "timeline.era.all": "All",
        "timeline.era.early": "Early ideas",
        "timeline.era.early.num": "Era 01",
        "timeline.era.early.range": "1950 – 1966",
        "timeline.era.early.desc": "Big questions, first programs and huge hopes.",
        "timeline.era.ups": "Ups & downs",
        "timeline.era.ups.num": "Era 02",
        "timeline.era.ups.range": "1970s – 2011",
        "timeline.era.ups.desc": "Disappointments and funding cuts — and a few famous wins.",
        "timeline.era.deep": "Deep learning",
        "timeline.era.deep.num": "Era 03",
        "timeline.era.deep.range": "2012 – 2020",
        "timeline.era.deep.desc": "Neural networks, big data and fast chips change everything.",
        "timeline.era.gen": "Generative AI",
        "timeline.era.gen.num": "Era 04",
        "timeline.era.gen.range": "2022 – today",
        "timeline.era.gen.desc": "AI that writes, draws and talks — now in everyone's hands.",
        "timeline.why": "Why it mattered",
        "timeline.whyNow": "Why it matters",
        "timeline.inGlossary": "In the glossary:",
        "timeline.openTerm": "Open “{term}” in the glossary",
        "timeline.showing.one": "Showing {n} milestone",
        "timeline.showing.few": "Showing {n} milestones",
        "timeline.showing.many": "Showing {n} milestones",

        "timeline.e1.year": "1950",
        "timeline.e1.title": "Alan Turing asks: “Can machines think?”",
        "timeline.e1.text": "In his paper “Computing Machinery and Intelligence”, the British mathematician Alan Turing suggested the “imitation game”: if a machine can chat so well that you can't tell it apart from a person, perhaps we should call it intelligent.",
        "timeline.e1.why": "It turned a big philosophical question into an experiment — today known as the Turing test.",

        "timeline.e2.year": "1956",
        "timeline.e2.title": "The Dartmouth workshop gives AI its name",
        "timeline.e2.text": "In the summer of 1956, scientists met at Dartmouth College in the USA for a workshop organised by John McCarthy and his colleagues. The plan for this workshop introduced a new name for the field: “artificial intelligence”.",
        "timeline.e2.why": "AI became a research field of its own — with very big hopes about how quickly it would succeed.",

        "timeline.e3.year": "1958",
        "timeline.e3.title": "The perceptron: a machine that learns",
        "timeline.e3.text": "Psychologist Frank Rosenblatt introduced the perceptron, one of the first artificial neural networks. It could learn to recognise simple patterns by adjusting its weights after every mistake.",
        "timeline.e3.why": "It was an early version of the idea behind today's neural networks: learning from examples instead of following fixed rules.",

        "timeline.e4.year": "1966",
        "timeline.e4.title": "ELIZA, one of the first chatbots",
        "timeline.e4.text": "At MIT, Joseph Weizenbaum created ELIZA, a program that chatted like a therapist using simple rules. Mostly, it turned your own words back into questions.",
        "timeline.e4.why": "Many people felt that ELIZA understood them, although it understood nothing. This “ELIZA effect” is still worth remembering when you talk to chatbots today.",

        "timeline.e5.year": "1970s–80s",
        "timeline.e5.title": "The “AI winters”",
        "timeline.e5.text": "Early AI promised too much, too soon, and computers were still slow. When the results disappointed, governments and companies cut funding — first in the 1970s, and again in the late 1980s after a boom in “expert systems”.",
        "timeline.e5.why": "A lesson about hype: big promises that aren't kept can freeze progress for years.",

        "timeline.e6.year": "1997",
        "timeline.e6.title": "Deep Blue beats the world chess champion",
        "timeline.e6.text": "IBM's computer Deep Blue defeated Garry Kasparov in a six-game match. It didn't learn the way modern AI does: special hardware let it check about 200 million chess positions every second.",
        "timeline.e6.why": "For the first time, a computer beat the reigning world champion in a match under tournament conditions. It showed what raw computing power could do.",

        "timeline.e7.year": "2011",
        "timeline.e7.title": "Watson wins Jeopardy!, and Siri arrives",
        "timeline.e7.text": "IBM's Watson beat two of the best champions of the TV quiz show Jeopardy!, answering tricky questions asked in everyday language. In the same year, Apple introduced the voice assistant Siri on the iPhone 4S.",
        "timeline.e7.why": "Computers were getting much better at understanding human language — and AI started moving into people's pockets.",

        "timeline.e8.year": "2012",
        "timeline.e8.title": "AlexNet starts the deep-learning boom",
        "timeline.e8.text": "A deep neural network called AlexNet, built by Alex Krizhevsky, Ilya Sutskever and Geoffrey Hinton, won the ImageNet image-recognition contest by a huge margin. It was trained on graphics cards (GPUs) — chips first made for video games.",
        "timeline.e8.why": "It proved that big neural networks + lots of data + fast chips really work. Within a few years, deep learning was everywhere: photos, speech, translation.",

        "timeline.e9.year": "2014",
        "timeline.e9.title": "GANs: AI learns to create images",
        "timeline.e9.text": "Ian Goodfellow and his colleagues invented generative adversarial networks (GANs). Two neural networks compete: one makes fake images, the other tries to spot the fakes, and both keep getting better.",
        "timeline.e9.why": "Computers began to create realistic new pictures. This paved the way for today's generative AI — and also for deepfakes.",

        "timeline.e10.year": "2016",
        "timeline.e10.title": "AlphaGo beats Lee Sedol at Go",
        "timeline.e10.text": "DeepMind's AlphaGo defeated Lee Sedol, one of the world's best Go players, 4–1 in Seoul. Go has more possible board positions than there are atoms in the observable universe, so just checking every move could never work.",
        "timeline.e10.why": "AlphaGo learned from human games and then by playing against itself (reinforcement learning). Some of its moves, like the famous “Move 37”, surprised even top experts.",

        "timeline.e11.year": "2017",
        "timeline.e11.title": "The Transformer: “Attention Is All You Need”",
        "timeline.e11.text": "Researchers at Google published a paper that introduced the Transformer, a new neural network design. It uses “attention” to look at all the words of a text at once and work out how they relate to each other.",
        "timeline.e11.why": "Transformers became the foundation of almost every modern language model. The “T” in GPT stands for Transformer.",

        "timeline.e12.year": "2020",
        "timeline.e12.title": "AlphaFold 2: a breakthrough in biology",
        "timeline.e12.text": "At the CASP14 science competition, DeepMind's AlphaFold 2 predicted the 3D shapes of proteins from their building blocks, often almost as accurately as lab experiments. Scientists had been working on this problem for about 50 years.",
        "timeline.e12.why": "A protein's shape helps explain how it works in our bodies and how diseases might be treated. AlphaFold's database now holds predicted structures for over 200 million proteins.",

        "timeline.e13.year": "2022",
        "timeline.e13.title": "ChatGPT goes public",
        "timeline.e13.text": "On 30 November 2022, OpenAI released ChatGPT, a chatbot built on a large language model. According to widely reported estimates, it reached about 100 million users in roughly two months — one of the fastest-growing apps ever.",
        "timeline.e13.why": "Suddenly, millions of people could talk to AI in plain language. Generative AI became an everyday topic at school, at work and at home.",

        "timeline.e14.year": "2024",
        "timeline.e14.title": "Nobel Prizes for AI pioneers",
        "timeline.e14.text": "The Nobel Prize in Physics went to John Hopfield and Geoffrey Hinton for discoveries that made machine learning with neural networks possible. The Chemistry prize went to Demis Hassabis and John Jumper for AlphaFold, together with David Baker for designing new proteins with computers.",
        "timeline.e14.why": "Science's most famous awards recognised AI both as a field of discovery and as a powerful tool for other sciences.",

        "timeline.e15.year": "Today",
        "timeline.e15.title": "AI in your pocket, your classroom and the lab",
        "timeline.e15.text": "AI now helps to translate languages, edit photos, recommend videos, support doctors and speed up science. Many students use AI chatbots to learn — and the open questions matter as much as the technology.",
        "timeline.e15.why": "How do we keep AI fair, safe and honest? Who is responsible when it makes a mistake? How will it change jobs and school? The answers depend on people — including you."
    },
    ru: {
        "timeline.filterLabel": "Фильтр хронологии по эпохам",
        "timeline.era.all": "Все",
        "timeline.era.early": "Первые идеи",
        "timeline.era.early.num": "Эпоха 01",
        "timeline.era.early.range": "1950 – 1966",
        "timeline.era.early.desc": "Большие вопросы, первые программы и огромные надежды.",
        "timeline.era.ups": "Взлёты и падения",
        "timeline.era.ups.num": "Эпоха 02",
        "timeline.era.ups.range": "1970-е – 2011",
        "timeline.era.ups.desc": "Разочарования и урезанные бюджеты — и несколько громких побед.",
        "timeline.era.deep": "Глубокое обучение",
        "timeline.era.deep.num": "Эпоха 03",
        "timeline.era.deep.range": "2012 – 2020",
        "timeline.era.deep.desc": "Нейросети, большие данные и быстрые чипы меняют всё.",
        "timeline.era.gen": "Генеративный ИИ",
        "timeline.era.gen.num": "Эпоха 04",
        "timeline.era.gen.range": "2022 – сегодня",
        "timeline.era.gen.desc": "ИИ, который пишет, рисует и разговаривает, — теперь доступен каждому.",
        "timeline.why": "Почему это было важно",
        "timeline.whyNow": "Почему это важно",
        "timeline.inGlossary": "В словаре:",
        "timeline.openTerm": "Открыть «{term}» в словаре",
        "timeline.showing.one": "Показано {n} событие",
        "timeline.showing.few": "Показано {n} события",
        "timeline.showing.many": "Показано {n} событий",

        "timeline.e1.year": "1950",
        "timeline.e1.title": "Алан Тьюринг спрашивает: «Могут ли машины мыслить?»",
        "timeline.e1.text": "В статье «Вычислительные машины и разум» британский математик Алан Тьюринг предложил «игру в имитацию»: если машина переписывается так, что её не отличить от человека, возможно, её стоит считать разумной.",
        "timeline.e1.why": "Он превратил большой философский вопрос в эксперимент, который сегодня называют тестом Тьюринга.",

        "timeline.e2.year": "1956",
        "timeline.e2.title": "Дартмутский семинар: у ИИ появляется имя",
        "timeline.e2.text": "Летом 1956 года учёные собрались в Дартмутском колледже (США) на семинар, который организовали Джон Маккарти и его коллеги. В плане этого семинара и появилось новое название области — «искусственный интеллект».",
        "timeline.e2.why": "ИИ стал отдельной областью науки — с очень большими надеждами на быстрый успех.",

        "timeline.e3.year": "1958",
        "timeline.e3.title": "Перцептрон: машина, которая учится",
        "timeline.e3.text": "Психолог Фрэнк Розенблатт представил перцептрон — одну из первых искусственных нейронных сетей. Он мог научиться узнавать простые образы, подправляя свои веса после каждой ошибки.",
        "timeline.e3.why": "Это ранняя версия идеи, на которой построены современные нейросети: учиться на примерах, а не следовать жёстким правилам.",

        "timeline.e4.year": "1966",
        "timeline.e4.title": "ELIZA — один из первых чат-ботов",
        "timeline.e4.text": "В MIT Джозеф Вейценбаум создал ELIZA — программу, которая вела беседу как психотерапевт по простым правилам. В основном она превращала твои же слова в вопросы.",
        "timeline.e4.why": "Многим казалось, что ELIZA их понимает, хотя она не понимала ничего. Об этом «эффекте ELIZA» полезно помнить и сегодня, когда общаешься с чат-ботами.",

        "timeline.e5.year": "1970–80-е",
        "timeline.e5.title": "«Зимы» искусственного интеллекта",
        "timeline.e5.text": "Первые исследователи ИИ обещали слишком много и слишком быстро, а компьютеры были ещё медленными. Когда результаты разочаровали, правительства и компании урезали финансирование — сначала в 1970-х, а потом снова в конце 1980-х, после бума «экспертных систем».",
        "timeline.e5.why": "Урок о хайпе: невыполненные громкие обещания могут «заморозить» развитие на годы.",

        "timeline.e6.year": "1997",
        "timeline.e6.title": "Deep Blue обыгрывает чемпиона мира по шахматам",
        "timeline.e6.text": "Компьютер Deep Blue от IBM победил Гарри Каспарова в матче из шести партий. Он не учился, как современный ИИ: специальное «железо» позволяло ему проверять около 200 миллионов позиций в секунду.",
        "timeline.e6.why": "Впервые компьютер выиграл матч у действующего чемпиона мира в турнирных условиях. Это показало, на что способна чистая вычислительная мощь.",

        "timeline.e7.year": "2011",
        "timeline.e7.title": "Watson выигрывает Jeopardy!, и появляется Siri",
        "timeline.e7.text": "Система Watson от IBM обыграла двух лучших чемпионов американской телевикторины Jeopardy!, отвечая на хитрые вопросы, заданные обычным языком. В том же году Apple представила голосового помощника Siri в iPhone 4S.",
        "timeline.e7.why": "Компьютеры стали гораздо лучше понимать человеческий язык — и ИИ начал перебираться в карманы людей.",

        "timeline.e8.year": "2012",
        "timeline.e8.title": "AlexNet запускает бум глубокого обучения",
        "timeline.e8.text": "Глубокая нейросеть AlexNet, которую создали Алекс Крижевский, Илья Суцкевер и Джеффри Хинтон, с огромным отрывом выиграла конкурс по распознаванию изображений ImageNet. Её обучали на видеокартах (GPU) — чипах, которые изначально делали для видеоигр.",
        "timeline.e8.why": "Она доказала, что большие нейросети + много данных + быстрые чипы действительно работают. Через несколько лет глубокое обучение было повсюду: в фото, распознавании речи, переводе.",

        "timeline.e9.year": "2014",
        "timeline.e9.title": "GAN: ИИ учится создавать изображения",
        "timeline.e9.text": "Ян Гудфеллоу и его коллеги придумали генеративно-состязательные сети (GAN). Две нейросети соревнуются: одна создаёт поддельные картинки, другая пытается их распознать, и обе становятся всё лучше.",
        "timeline.e9.why": "Компьютеры начали создавать реалистичные новые изображения. Так открылся путь к современному генеративному ИИ — а заодно и к дипфейкам.",

        "timeline.e10.year": "2016",
        "timeline.e10.title": "AlphaGo обыгрывает Ли Седоля в го",
        "timeline.e10.text": "Программа AlphaGo от DeepMind победила Ли Седоля, одного из лучших игроков в го в мире, со счётом 4:1 в Сеуле. В го возможных позиций больше, чем атомов в наблюдаемой Вселенной, поэтому простым перебором всех ходов тут не победить.",
        "timeline.e10.why": "AlphaGo училась на партиях людей, а потом — играя сама с собой (обучение с подкреплением). Некоторые её ходы, например знаменитый «37-й ход», удивили даже лучших экспертов.",

        "timeline.e11.year": "2017",
        "timeline.e11.title": "Трансформер: «Attention Is All You Need»",
        "timeline.e11.text": "Исследователи из Google опубликовали статью (её название переводится как «Внимание — это всё, что вам нужно»), в которой представили трансформер — новую архитектуру нейросети. С помощью механизма «внимания» она смотрит сразу на все слова текста и выясняет, как они связаны.",
        "timeline.e11.why": "Трансформеры стали основой почти всех современных языковых моделей. Буква «T» в GPT означает Transformer.",

        "timeline.e12.year": "2020",
        "timeline.e12.title": "AlphaFold 2: прорыв в биологии",
        "timeline.e12.text": "На научном конкурсе CASP14 программа AlphaFold 2 от DeepMind предсказывала трёхмерную форму белков по их «строительным блокам» — часто почти так же точно, как лабораторные эксперименты. Над этой задачей учёные бились около 50 лет.",
        "timeline.e12.why": "Форма белка помогает понять, как он работает в нашем организме и как можно лечить болезни. Сейчас в базе AlphaFold есть предсказанные структуры более 200 миллионов белков.",

        "timeline.e13.year": "2022",
        "timeline.e13.title": "ChatGPT становится доступен всем",
        "timeline.e13.text": "30 ноября 2022 года OpenAI выпустила ChatGPT — чат-бот на основе большой языковой модели. По широко цитируемым оценкам, примерно за два месяца у него появилось около 100 миллионов пользователей — это одно из самых быстрорастущих приложений в истории.",
        "timeline.e13.why": "Внезапно миллионы людей смогли общаться с ИИ обычным языком. Генеративный ИИ стал повседневной темой в школе, на работе и дома.",

        "timeline.e14.year": "2024",
        "timeline.e14.title": "Нобелевские премии пионерам ИИ",
        "timeline.e14.text": "Нобелевскую премию по физике получили Джон Хопфилд и Джеффри Хинтон за открытия, благодаря которым стало возможно машинное обучение с помощью нейросетей. Премию по химии вручили Демису Хассабису и Джону Джамперу за AlphaFold, а также Дэвиду Бейкеру — за создание новых белков с помощью компьютера.",
        "timeline.e14.why": "Самые известные научные награды признали ИИ и отдельной областью открытий, и мощным инструментом для других наук.",

        "timeline.e15.year": "Сегодня",
        "timeline.e15.title": "ИИ в кармане, в классе и в лаборатории",
        "timeline.e15.text": "Сегодня ИИ помогает переводить тексты, обрабатывать фото, подбирать видео, поддерживать врачей и ускорять науку. Многие школьники учатся с помощью чат-ботов, и открытые вопросы важны не меньше самих технологий.",
        "timeline.e15.why": "Как сделать ИИ честным, безопасным и справедливым? Кто отвечает, если он ошибается? Как он изменит работу и учёбу? Ответы зависят от людей — и от тебя тоже."
    }
});
