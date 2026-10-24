/* =========================================================
   AI COMPASS — TIMELINE ("A Short History of AI")
   This file builds:
   1. era filter chips (All, Early ideas, Ups & downs, ...)
      in a bar that sticks to the top while you read
   2. a vertical timeline: a glowing line fills up as you
      scroll, and every milestone lights up when the line
      reaches it
   3. "In the glossary" buttons that jump to the matching
      term in the glossary (js/glossary.js)
   All the texts are translations, so core.js switches the
   language by itself and nothing is lost.
   ========================================================= */

(function () {
    "use strict";

    const A = window.AICompass;
    const mount = document.querySelector('[data-feature="timeline"]');
    if (!A || !mount) return;

    const t = A.t;
    const esc = A.escapeHTML;

    // The line is "filled" up to this point of the screen (60% from the top)
    const READ_LINE = 0.6;

    // ---------- 1. Eras and milestones ----------
    // key: the start of the translation keys ("timeline.e1.title", ...)
    // datetime: the year for the <time> element (empty if it is not one year)
    // terms: glossary terms to link to
    const ERAS = ["early", "ups", "deep", "gen"];

    const EVENTS = [
        { key: "e1", era: "early", icon: "🤔", datetime: "1950", terms: ["turing-test"] },
        { key: "e2", era: "early", icon: "🏫", datetime: "1956", terms: ["ai"] },
        { key: "e3", era: "early", icon: "🔗", datetime: "1958", terms: ["neuron"] },
        { key: "e4", era: "early", icon: "💬", datetime: "1966", terms: ["chatbot"] },
        { key: "e5", era: "ups", icon: "❄️", datetime: "", terms: [] },
        { key: "e6", era: "ups", icon: "♟️", datetime: "1997", terms: ["algorithm"] },
        { key: "e7", era: "ups", icon: "🎙️", datetime: "2011", terms: ["nlp"] },
        { key: "e8", era: "deep", icon: "🖼️", datetime: "2012", terms: ["deep-learning", "computer-vision"] },
        { key: "e9", era: "deep", icon: "🎨", datetime: "2014", terms: ["generative-ai", "deepfake"] },
        { key: "e10", era: "deep", icon: "⚫", datetime: "2016", terms: ["reinforcement"] },
        { key: "e11", era: "deep", icon: "⚡", datetime: "2017", terms: ["transformer"] },
        { key: "e12", era: "deep", icon: "🧬", datetime: "2020", terms: ["deep-learning"] },
        { key: "e13", era: "gen", icon: "🚀", datetime: "2022", terms: ["chatbot", "llm"] },
        { key: "e14", era: "gen", icon: "🏅", datetime: "2024", terms: ["neural-network"] },
        { key: "e15", era: "gen", icon: "📱", datetime: "", terms: ["bias", "privacy"], today: true }
    ];

    // ---------- 2. Translations ----------
    A.addTranslations({
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

    // ---------- 3. Small helpers ----------

    // Picks the right plural form. English has two (1 milestone / 2 milestones),
    // Russian has three (1 событие / 2 события / 5 событий).
    function pluralForm(n) {
        if (A.lang !== "ru") return n === 1 ? "one" : "many";
        const lastDigit = n % 10;
        const lastTwo = n % 100;
        if (lastDigit === 1 && lastTwo !== 11) return "one";
        if (lastDigit >= 2 && lastDigit <= 4 && (lastTwo < 12 || lastTwo > 14)) return "few";
        return "many";
    }

    // Animations are skipped when the device asks for less motion
    // or when "calm mode" (from effects.js) is on
    function motionOK() {
        return !A.reducedMotion && !document.documentElement.classList.contains("fx-calm");
    }

    function clamp(value, min, max) {
        return Math.max(min, Math.min(max, value));
    }

    // A translated piece of text. data-i18n lets core.js re-translate it by itself.
    function text(key, className, tag) {
        tag = tag || "span";
        return "<" + tag + (className ? ' class="' + className + '"' : "") + ' data-i18n="' + key + '">' + t(key) + "</" + tag + ">";
    }

    // Distance from the top of an ancestor, ignoring animations (transforms)
    function offsetWithin(element, ancestor) {
        let y = 0;
        while (element && element !== ancestor) {
            y += element.offsetTop;
            element = element.offsetParent;
        }
        return y;
    }

    // The glossary (js/glossary.js) may be missing: then there are no term buttons
    function glossaryTerm(id) {
        return A.glossary && A.glossary.term ? A.glossary.term(id) : null;
    }

    // ---------- 4. Building the page ----------
    function chipHTML(era) {
        const count = era === "all" ? EVENTS.length : EVENTS.filter(function (event) { return event.era === era; }).length;
        return '<button class="chip tl-chip" type="button" data-era="' + era + '" aria-pressed="' + (era === "all") + '">' +
            '<span class="tl-chip-dot" aria-hidden="true"></span>' +
            text("timeline.era." + era) +
            '<span class="tl-chip-count mono">' + count + "</span>" +
        "</button>";
    }

    function termsHTML(event) {
        const terms = event.terms.filter(glossaryTerm);
        if (!terms.length) return "";
        return '<div class="tl-terms">' +
            '<span class="tl-terms-label mono"><span aria-hidden="true">📖</span> ' + text("timeline.inGlossary") + "</span>" +
            terms.map(function (id) {
                const term = glossaryTerm(id);
                return '<button class="chip tl-term" type="button" data-term="' + id + '" aria-label="' + esc(t("timeline.openTerm", { term: term.term })) + '">' +
                    '<span class="tl-term-name">' + esc(term.term) + "</span>" +
                    '<span class="tl-term-arrow" aria-hidden="true">↗</span>' +
                "</button>";
            }).join("") +
        "</div>";
    }

    function eventHTML(event, index) {
        const side = index % 2 === 0 ? "left" : "right";
        const k = "timeline." + event.key + ".";
        const yearTag = event.datetime ? 'time datetime="' + event.datetime + '"' : "span";
        const yearEnd = event.datetime ? "time" : "span";

        return '<li class="tl-item is-' + side + (event.today ? " is-today" : "") + '" data-key="' + event.key + '" data-reveal="fade">' +
            '<div class="tl-node" aria-hidden="true"><span class="tl-node-icon">' + event.icon + "</span></div>" +
            '<p class="tl-ghost" aria-hidden="true" data-i18n="' + k + 'year">' + t(k + "year") + "</p>" +
            '<article class="tl-card card" aria-labelledby="tl-title-' + event.key + '">' +
                '<div class="tl-meta">' +
                    "<" + yearTag + ' class="tl-year mono" data-scramble data-i18n="' + k + 'year">' + t(k + "year") + "</" + yearEnd + ">" +
                    text("timeline.era." + event.era, "tl-era-tag mono") +
                "</div>" +
                '<h4 class="tl-title" id="tl-title-' + event.key + '" data-i18n="' + k + 'title">' + t(k + "title") + "</h4>" +
                text(k + "text", "tl-text", "p") +
                '<div class="tl-why">' +
                    '<p class="tl-why-label mono"><span aria-hidden="true">✦</span> ' + text(event.today ? "timeline.whyNow" : "timeline.why") + "</p>" +
                    text(k + "why", "tl-why-text", "p") +
                "</div>" +
                termsHTML(event) +
            "</article>" +
        "</li>";
    }

    function eraHTML(era) {
        const k = "timeline.era." + era;
        return '<section class="tl-era" data-era="' + era + '" aria-labelledby="tl-era-' + era + '">' +
            '<header class="tl-era-head" data-reveal="zoom">' +
                text(k + ".num", "tl-era-num mono") +
                '<h3 class="tl-era-title" id="tl-era-' + era + '" data-i18n="' + k + '">' + t(k) + "</h3>" +
                text(k + ".range", "tl-era-range mono") +
                text(k + ".desc", "tl-era-desc", "p") +
            "</header>" +
            '<ol class="tl-list">' +
                EVENTS.map(function (event, index) {
                    return event.era === era ? eventHTML(event, index) : "";
                }).join("") +
            "</ol>" +
        "</section>";
    }

    mount.innerHTML =
        '<div class="tl">' +
            '<div class="tl-bar">' +
                '<div class="tl-filters" role="group" data-i18n-attr="aria-label:timeline.filterLabel" aria-label="' + esc(t("timeline.filterLabel")) + '">' +
                    ["all"].concat(ERAS).map(chipHTML).join("") +
                "</div>" +
                // A small read-out: the year the line has reached, and how many milestones
                '<div class="tl-hud" aria-hidden="true">' +
                    '<span class="tl-hud-dot"></span>' +
                    '<span class="tl-hud-year">—</span>' +
                    '<span class="tl-hud-count mono">00/' + EVENTS.length + "</span>" +
                "</div>" +
            "</div>" +
            '<p class="sr-only tl-live" aria-live="polite" aria-atomic="true"></p>' +

            '<div class="tl-wrap">' +
                '<div class="tl-line" aria-hidden="true">' +
                    '<span class="tl-fill"></span>' +
                    '<span class="tl-head"></span>' +
                "</div>" +
                ERAS.map(eraHTML).join("") +
            "</div>" +
        "</div>";

    // Handy references
    const root = mount.querySelector(".tl");
    const bar = root.querySelector(".tl-bar");
    const filters = root.querySelector(".tl-filters");
    const live = root.querySelector(".tl-live");
    const wrap = root.querySelector(".tl-wrap");
    const line = root.querySelector(".tl-line");
    const fill = root.querySelector(".tl-fill");
    const head = root.querySelector(".tl-head");
    const hudYear = root.querySelector(".tl-hud-year");
    const hudCount = root.querySelector(".tl-hud-count");
    const sections = Array.prototype.slice.call(root.querySelectorAll(".tl-era"));
    const items = Array.prototype.slice.call(root.querySelectorAll(".tl-item")).map(function (element) {
        return { el: element, node: element.querySelector(".tl-node"), key: element.getAttribute("data-key"), on: false };
    });

    // ---------- 5. The line that fills as you scroll ----------
    let nodes = [];             // the visible milestones and where their dots are
    let lineTop = 0;            // where the line starts (the first dot)
    let lineLength = 0;         // from the first dot to the last one
    let shown = 0;              // how much of the line is filled now (px)
    let frame = 0;
    let lastTime = 0;
    let jump = true;            // the first frame jumps straight to the right place
    let inView = false;
    let hudText = "";

    // The filter bar sticks under the menu only while its chips fit in one row.
    // It also tells the CSS how much room focused buttons need above them.
    function measureBar() {
        const chip = filters.querySelector(".tl-chip");
        const twoRows = bar.offsetHeight > chip.offsetHeight * 1.5 + 20;
        root.classList.toggle("is-stacked", twoRows);
        const sticky = getComputedStyle(bar).position === "sticky";
        root.style.setProperty("--tl-bar-room", sticky ? bar.offsetHeight + 12 + "px" : "0px");
    }

    // Measures where every visible dot is (after a resize, a filter or a new language)
    function measure() {
        measureBar();
        nodes = items.filter(function (item) {
            return item.el.offsetParent !== null;
        }).map(function (item) {
            return { item: item, y: offsetWithin(item.node, wrap) + item.node.offsetHeight / 2 };
        });

        lineTop = nodes.length ? nodes[0].y : 0;
        lineLength = nodes.length ? nodes[nodes.length - 1].y - lineTop : 0;
        line.style.top = lineTop + "px";
        line.style.height = lineLength + "px";
        // Hidden milestones are switched off, and checked again when they come back
        items.forEach(function (item) {
            if (item.el.offsetParent === null) {
                item.on = null;
                item.el.classList.remove("is-reached");
            }
        });
        jump = true;
        requestUpdate();
    }

    function requestUpdate() {
        if (!frame) frame = requestAnimationFrame(update);
    }

    function update(now) {
        frame = 0;
        const top = wrap.getBoundingClientRect().top;
        const target = clamp(window.innerHeight * READ_LINE - top - lineTop, 0, lineLength);

        // The fill glides smoothly after the scroll position (unless motion is off)
        if (jump || !inView || !motionOK()) {
            shown = target;
        } else {
            const seconds = lastTime ? Math.min(0.05, (now - lastTime) / 1000) : 0.016;
            shown += (target - shown) * (1 - Math.exp(-seconds * 10));
            if (Math.abs(target - shown) < 0.5) shown = target;
        }
        jump = false;
        lastTime = now;

        fill.style.transform = "scaleY(" + (lineLength > 0 ? shown / lineLength : 0).toFixed(4) + ")";
        head.style.transform = "translate3d(0, " + shown.toFixed(1) + "px, 0)";
        head.classList.toggle("is-end", lineLength > 0 && shown >= lineLength - 0.5);

        // Light up every dot the line has reached
        let reached = 0;
        let lastReached = null;
        nodes.forEach(function (node) {
            const on = node.y - lineTop <= shown + 2;
            if (on !== node.item.on) {
                node.item.on = on;
                node.item.el.classList.toggle("is-reached", on);
            }
            if (on) {
                reached++;
                lastReached = node.item;
            }
        });

        // The read-out in the bar (only written when it changes)
        const year = lastReached ? t("timeline." + lastReached.key + ".year") : "—";
        const count = String(reached).padStart(2, "0") + "/" + String(nodes.length).padStart(2, "0");
        if (year + count !== hudText) {
            hudText = year + count;
            hudYear.textContent = year;
            hudCount.textContent = count;
        }

        if (shown !== target) {
            frame = requestAnimationFrame(update);
        } else {
            lastTime = 0;
        }
    }

    // Only follow the scroll while the timeline is on (or near) the screen
    if ("IntersectionObserver" in window) {
        new IntersectionObserver(function (entries) {
            inView = entries[0].isIntersecting;
            requestUpdate();
        }, { rootMargin: "120px 0px" }).observe(wrap);
    } else {
        inView = true;
    }

    window.addEventListener("scroll", function () {
        if (inView) requestUpdate();
    }, { passive: true });

    window.addEventListener("resize", measure);
    if ("ResizeObserver" in window) {
        let lastHeight = 0;
        new ResizeObserver(function () {
            const height = wrap.offsetHeight;
            if (height !== lastHeight) {
                lastHeight = height;
                measure();
            }
        }).observe(wrap);
    }

    // Coming back to the tab: catch up at once
    document.addEventListener("visibilitychange", function () {
        if (!document.hidden) {
            jump = true;
            requestUpdate();
        }
    });

    // ---------- 6. Era filter ----------
    let currentEra = "all";
    let filterToken = 0;
    let running = [];

    // Browsers try to keep what you are looking at in place when content above it
    // changes ("scroll anchoring"). That would fight our own scrolling, so it is
    // switched off for a moment while milestones appear and disappear.
    function pauseScrollAnchoring() {
        const html = document.documentElement;
        html.style.overflowAnchor = "none";
        requestAnimationFrame(function () {
            requestAnimationFrame(function () { html.style.overflowAnchor = ""; });
        });
    }

    // Tells screen readers how many milestones are shown now
    function announce() {
        const count = EVENTS.filter(function (event) { return currentEra === "all" || event.era === currentEra; }).length;
        live.textContent = t("timeline.showing." + pluralForm(count), { n: count });
    }

    function showsEra(section, era) {
        return era === "all" || section.getAttribute("data-era") === era;
    }

    function setEra(era) {
        if (era === currentEra) return;
        currentEra = era;
        const token = ++filterToken;

        filters.querySelectorAll(".tl-chip").forEach(function (chip) {
            chip.setAttribute("aria-pressed", String(chip.getAttribute("data-era") === era));
        });

        // Stop animations from a previous click
        running.forEach(function (animation) { animation.cancel(); });
        running = [];

        const leaving = sections.filter(function (section) { return !section.hidden && !showsEra(section, era); });
        const entering = sections.filter(function (section) { return section.hidden && showsEra(section, era); });

        function swap() {
            if (token !== filterToken) return;
            pauseScrollAnchoring();
            leaving.forEach(function (section) { section.hidden = true; });
            entering.forEach(function (section) { section.hidden = false; });

            // If you were reading further down, go back to the start of the timeline,
            // just under the bar (or under the menu, where the bar doesn't stick)
            const barStyle = getComputedStyle(bar);
            const space = barStyle.position === "sticky"
                ? parseFloat(barStyle.top) + bar.offsetHeight + 24
                : (parseFloat(A.cssVar("--nav-height")) || 76) + 24;
            const wrapTop = wrap.getBoundingClientRect().top;
            if (wrapTop < space) {
                window.scrollTo({
                    top: window.scrollY + wrapTop - space,
                    behavior: motionOK() ? "smooth" : "auto"
                });
            }

            measure();

            // The new milestones rise in one after another
            if (motionOK()) {
                let index = 0;
                entering.forEach(function (section) {
                    Array.prototype.forEach.call(section.querySelectorAll(".tl-era-head, .tl-item"), function (element) {
                        running.push(element.animate(
                            [{ opacity: 0, transform: "translateY(28px)" }, { opacity: 1, transform: "none" }],
                            { duration: 520, delay: Math.min(index++, 8) * 70, easing: "cubic-bezier(0.22, 1, 0.36, 1)", fill: "backwards" }
                        ));
                    });
                });
            }

            announce();
        }

        if (motionOK() && leaving.length) {
            // Old milestones fade away first, then the new ones come in
            const fades = leaving.map(function (section) {
                return section.animate(
                    [{ opacity: 1, transform: "none" }, { opacity: 0, transform: "translateY(-14px) scale(0.98)" }],
                    { duration: 240, easing: "ease-in", fill: "forwards" }
                );
            });
            running = fades.slice();
            Promise.all(fades.map(function (animation) { return animation.finished; })).then(function () {
                if (token !== filterToken) return;
                swap();
                fades.forEach(function (animation) { animation.cancel(); });
            }).catch(function () {
                // Cancelled by a newer click: that click takes over
            });
        } else {
            swap();
        }
    }

    filters.addEventListener("click", function (event) {
        const chip = event.target.closest(".tl-chip");
        if (chip) setEra(chip.getAttribute("data-era"));
    });

    // ---------- 7. Glossary buttons ----------
    root.addEventListener("click", function (event) {
        const button = event.target.closest(".tl-term");
        if (button && A.glossary) A.glossary.show(button.getAttribute("data-term"), { focus: true });
    });

    // Keyboard focus must never hide under the sticky bar. The CSS scroll-margin
    // helps when the browser scrolls by itself, but a button that is already on
    // screen is not scrolled at all, so we check where it ended up and move the page.
    function keepClearOfBar(element) {
        if (document.activeElement !== element) return;
        if (getComputedStyle(bar).position !== "sticky") return;
        const barBottom = bar.getBoundingClientRect().bottom;
        const top = element.getBoundingClientRect().top;
        if (top < barBottom + 8) {
            window.scrollBy({ top: top - barBottom - 16, behavior: motionOK() ? "smooth" : "auto" });
        }
    }

    wrap.addEventListener("focusin", function (event) {
        const element = event.target;
        // Wait one frame, so the browser's own scrolling has happened first
        requestAnimationFrame(function () { keepClearOfBar(element); });
    });

    function updateTermButtons() {
        root.querySelectorAll(".tl-term").forEach(function (button) {
            const term = glossaryTerm(button.getAttribute("data-term"));
            if (!term) return;
            button.querySelector(".tl-term-name").textContent = term.term;
            button.setAttribute("aria-label", t("timeline.openTerm", { term: term.term }));
        });
    }

    // ---------- 8. Cards slide in from their own side on wide screens ----------
    const wideQuery = window.matchMedia("(min-width: 900px)");

    function updateSides() {
        root.classList.toggle("is-wide", wideQuery.matches);
    }

    if (wideQuery.addEventListener) wideQuery.addEventListener("change", updateSides);
    else if (wideQuery.addListener) wideQuery.addListener(updateSides);

    // Measuring waits for the next frame: by then every feature has built its
    // part of the page, so the browser lays the page out only once
    let measureQueued = false;
    function measureSoon() {
        if (measureQueued) return;
        measureQueued = true;
        requestAnimationFrame(function () {
            measureQueued = false;
            measure();
        });
    }

    // ---------- 9. Language changes ----------
    // core.js has already translated every [data-i18n] text; we only update our extras
    A.onLanguageChange(function () {
        updateTermButtons();
        // Quietly forget the last announcement (it was in the old language)
        live.textContent = "";
        hudText = "";
        measureSoon();
    });

    // Calm mode (effects.js) switched on or off
    document.addEventListener("aic:effects", function () {
        jump = true;
        requestUpdate();
    });

    // ---------- 10. Start ----------
    updateSides();
    measureSoon();

    // Web fonts change the height of texts a little: measure again once they are ready
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(measure);
    window.addEventListener("load", measure);
})();
