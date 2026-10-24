/* =========================================================
   AI COMPASS — COMPASS BOT (the floating assistant)
   A friendly chat helper in the bottom-right corner.

   Important: Compass Bot is NOT a real AI. It is a small
   "rule-based" chatbot, like ELIZA from 1966: it looks for
   keywords in your message and picks a prepared answer.
   The chat window says this honestly, too.

   Sections of this file:
    1. Translations
    2. Small helpers
    3. Answers the bot can give (drawn in the current language)
    4. The bot's "brain": keywords and intents
    5. Building the chat window
    6. Showing messages
    7. Typing dots and the reply queue
    8. Buttons inside messages (actions)
    9. Opening and closing the chat
   10. Saving the chat for this tab (sessionStorage)
   11. Little extras: the "Ask me" hint and eyes that follow you
   12. Language, Ctrl+K commands, public API and start-up
   ========================================================= */

(function () {
    "use strict";

    const A = window.AICompass;
    const mount = document.querySelector('[data-feature="assistant"]');
    if (!A || !mount) return;

    const t = A.t;
    const esc = A.escapeHTML;

    /* =========================================================
       1. TRANSLATIONS
       ========================================================= */
    A.addTranslations({
        en: {
            // ----- The chat window -----
            "assistant.name": "Compass Bot",
            "assistant.launcher": "Chat with Compass Bot",
            "assistant.tip": "Ask me about AI!",
            "assistant.tipClose": "Hide this hint",
            "assistant.status": "Online · scripted demo",
            "assistant.statusTyping": "Typing…",
            "assistant.disclaimer": "<strong>Honest note:</strong> I'm a scripted demo bot. I match keywords — I'm not a real AI, just like the very first chatbots such as ELIZA (1966).",
            "assistant.reset": "Start a new chat",
            "assistant.close": "Close the chat",
            "assistant.logLabel": "Messages",
            "assistant.chipsLabel": "Quick questions",
            "assistant.inputLabel": "Your message",
            "assistant.placeholder": "Ask me about AI…",
            "assistant.send": "Send",
            "assistant.youSaid": "You:",
            "assistant.botSaid": "Compass Bot:",

            // ----- Quick-reply chips -----
            "assistant.chip.ai": "What is AI?",
            "assistant.chip.lesson": "Recommend a lesson",
            "assistant.chip.quiz": "Start the quiz",
            "assistant.chip.lab": "Open the AI Lab",
            "assistant.chip.fact": "Fun fact",
            "assistant.chip.define": "Define a word",
            "assistant.chip.joke": "Tell me a joke",

            // ----- Buttons inside messages -----
            "assistant.act.lesson": "Open lesson {n}",
            "assistant.act.quiz": "Start the quiz",
            "assistant.act.classifier": "Teach the machine",
            "assistant.act.predictor": "Next-word predictor",
            "assistant.act.showTerm": "Show in glossary",
            "assistant.act.section": "Go to: {section}",
            "assistant.act.fact": "Another fact",
            "assistant.act.joke": "Another joke",
            "assistant.act.word": "Another word",
            "assistant.act.lang.ru": "Switch to Russian",
            "assistant.act.lang.en": "Switch to English",
            "assistant.act.theme.dark": "Turn on the dark theme",
            "assistant.act.theme.light": "Turn on the light theme",

            // ----- Text put in the message box by "Define a word" -----
            "assistant.prefillDefine": "Define ",

            // ----- Lesson names inside sentences -----
            "assistant.lessonName": "Lesson {n}: {title}",
            "assistant.lessonNameShort": "Lesson {n}",
            "assistant.lessonWords": "lesson|lessons",

            // ----- The answers -----
            "assistant.r.welcome": "Hi! I'm <strong>Compass Bot</strong> 🧭 Ask me anything about AI — or tap one of the buttons below.",
            "assistant.r.greeting1": "Hey there! 👋 What would you like to know about AI?",
            "assistant.r.greeting2": "Hi! 😊 Let's explore AI together. Ask me something!",
            "assistant.r.greeting3": "Hello, human! 🤖 (Just kidding — I'm only a script.) How can I help?",
            "assistant.r.thanks": "You're welcome! 😊 Anything else you'd like to know?",
            "assistant.r.bye": "Bye! 👋 Come back any time — I'll be right here in the corner.",
            "assistant.r.howAreYou": "I'm great, thanks! Well… I'm a script, so I always feel exactly the same 😄 Want to learn something about AI?",
            "assistant.r.who": "I'm <strong>Compass Bot</strong>, the helper of this website. Honest confession: <strong>I'm not a real AI.</strong> I look for keywords in your message and pick a prepared answer — just like <strong>ELIZA</strong>, one of the very first chatbots (1966).<br><br>Modern AI chatbots like ChatGPT work very differently: they learned the patterns of language from huge amounts of text.",
            "assistant.r.ai": "<strong>Artificial Intelligence (AI)</strong> is when computers do tasks that usually need human intelligence: recognising faces, understanding speech, translating languages or recommending videos.<br><br>Most modern AI doesn't follow rules written by hand — it <strong>learns patterns from lots of examples</strong> (data). It can be really impressive, but it doesn't think or feel like a person.",
            "assistant.r.ml": "<strong>Machine learning</strong> means teaching a computer with examples instead of writing every rule by hand. You show a model lots of examples — say, photos labelled “cat” or “dog” — it finds patterns, and then it can make guesses about new examples it has never seen.<br><br>More good, varied examples usually mean better results. Want to try it? Teach a real neural network in the AI Lab!",
            "assistant.r.nn": "A <strong>neural network</strong> is a machine-learning model loosely inspired by the brain. It's built from layers of simple “neurons”: each one multiplies its inputs by numbers called <strong>weights</strong>, adds them up and passes the result on.<br><br>During training, the weights are adjusted little by little so the answers get better. <strong>Deep learning</strong> simply means neural networks with many layers.",
            "assistant.r.llm": "AI chatbots like ChatGPT, Claude or Gemini run on <strong>large language models (LLMs)</strong>. An LLM is trained on huge amounts of text to predict the next word — more exactly, the next small piece of text, called a <strong>token</strong>. Repeating that again and again produces whole answers.<br><br>LLMs are amazing with language, but they can be confidently wrong, so double-check important facts. And me? I'm much simpler — I just match keywords 🙂",
            "assistant.r.hallucination": "An AI <strong>hallucination</strong> is when a chatbot confidently says something that isn't true — a made-up fact, quote, date or even a source that doesn't exist. It happens because language models produce text that <em>sounds</em> likely; they don't check facts the way a person would.<br><br>How to protect yourself:<br>• check important facts in reliable sources<br>• if the AI names a source, open it and make sure it exists<br>• be extra careful with numbers, names and quotes",
            "assistant.r.bias": "AI learns from data created by people — so it can also learn our <strong>biases</strong>. For example, if a face-recognition system was trained mostly on photos of some groups of people, it may work worse for others.<br><br>That's why fair AI needs varied data, careful testing and people who check the results. AI ethics is also about honesty (saying when AI is used) and responsibility (someone must answer for an AI's decisions).",
            "assistant.r.privacy": "Good rule: <strong>don't share anything with an AI chatbot that you wouldn't post publicly</strong> — passwords, your home address, phone number, school name or private photos. Many AI services may save conversations and use them to improve their models.<br><br>Check the privacy settings, and ask a trusted adult if you're not sure. (By the way, I'm a simple script: what you type here stays in this browser tab only.)",
            "assistant.r.danger": "Today's AI is a <strong>tool</strong>, not an evil robot from the movies 🤖 — it has no wishes or goals of its own. But it does bring real risks: fake photos and videos (<strong>deepfakes</strong>), misinformation, bias, privacy problems and changes to many jobs. Some experts also worry about the risks of much more powerful AI in the future.<br><br>That's why researchers and governments work on AI safety and rules. Your best protection is knowledge and critical thinking — which is exactly what this site is for!",
            "assistant.r.homework": "AI can be a great study buddy 📚 — if you use it honestly.<br><br>✅ <strong>Good:</strong> ask it to explain a topic more simply, quiz you before a test, or give feedback on <em>your own</em> draft.<br>❌ <strong>Not okay:</strong> copying its answer and handing it in as your work — that's cheating, and you don't learn anything.<br><br>Remember that AI can be wrong, so check its facts — and always follow your school's rules about AI.",
            "assistant.r.eliza": "<strong>ELIZA</strong> was one of the first chatbots, created by Joseph Weizenbaum at MIT in 1966. Its most famous script pretended to be a therapist and turned your words into questions: “I feel sad” → “Why do you feel sad?”. Many people felt it understood them — but it only matched patterns. Just like me! 😄<br><br>The <strong>Turing test</strong> is even older: in 1950 Alan Turing suggested checking whether a machine could chat so well that a person couldn't tell it from a human.",
            "assistant.r.recStart": "Start from the very beginning: <strong>{lesson}</strong> — it takes just a few minutes 🚀",
            "assistant.r.recNext": "You've already finished {count} {lessons} out of 6 — nice work! 💪 Next up: <strong>{lesson}</strong>",
            "assistant.r.recAll": "Wow, all 6 lessons are done! 🏆 Time to test yourself in the quiz — or replay any lesson you like.",
            "assistant.r.games": "Yes — at some games AI beats the best humans! ♟️ In 1997 IBM's <strong>Deep Blue</strong> beat world chess champion Garry Kasparov, and in 2016 DeepMind's <strong>AlphaGo</strong> beat Lee Sedol at Go, 4 games to 1. Today the strongest chess programs play far better than any human.<br><br>But a chess program is only good at chess: being great at one game doesn't make an AI smart in general.",
            "assistant.r.conscious": "Does AI think or feel? <strong>No</strong> — as far as scientists can tell, today's AI has no feelings, consciousness or wishes. A chatbot can write “I'm happy”, but only because those words fit the patterns it learned. It's very good at <em>imitating</em> human language — that's not the same as being human 🙂",
            "assistant.r.sad": "I'm sorry you're feeling this way 💜 I'm only a simple script, so I can't really help with feelings — but talking to someone you trust, like a friend, a family member or a teacher, really can. You don't have to deal with it alone.",
            "assistant.r.support": "I'm really sorry you're going through this. I'm only a simple script, so I can't help with this properly — but <strong>you don't have to deal with it alone</strong>.<br><br>Please talk to a <strong>trusted adult right now</strong>: a parent, a teacher or your school counsellor.<br><br>If you are in danger, call your local emergency number: <strong>112</strong> in Europe and Russia, <strong>911</strong> in the US. You can also call a free helpline: <strong>116 111</strong> (for children and young people in many European countries) or <strong>988</strong> in the US.",
            "assistant.r.about": "<strong>AI Compass</strong> was made by students as a <strong>CAS project</strong> 🎓 — a free, bilingual guide that helps anyone understand how AI works, use it wisely and think about it critically. No sign-up, no ads.",
            "assistant.r.ack": "😊 Glad I could help! What next — a <strong>fun fact</strong>, a <strong>lesson</strong> or the <strong>quiz</strong>?",
            "assistant.r.lessonOpen": "Opening <strong>{lesson}</strong> 📖",
            "assistant.r.lessonMissing": "There are only 6 lessons on this site — try a number from 1 to 6 🙂",
            "assistant.r.lessonOffer": "Here's <strong>{lesson}</strong> 📖 Open it whenever you like:",
            "assistant.r.quiz": "Let's go! 🏆 Taking you to the AI Challenge — good luck!",
            "assistant.r.quizOffer": "Want to test yourself? 🏆 The <strong>AI Challenge</strong> is a short quiz about everything on this site. Start it whenever you're ready:",
            "assistant.r.lab": "Opening the AI Lab 🧪 There you can <strong>teach a real neural network</strong> or play with a <strong>next-word predictor</strong> — a tiny language model. Switch between them with the buttons below.",
            "assistant.r.labOffer": "The <strong>AI Lab</strong> has two experiments 🧪 You can <strong>teach a real neural network</strong> or play with a <strong>next-word predictor</strong> — a tiny language model. Pick one:",
            "assistant.r.themeOffer": "I can change how the site looks 🌓 Just press the button:",
            "assistant.r.nav": "Sure! Taking you to <strong>{section}</strong> {icon}",
            "assistant.r.themeDark": "Done! 🌙 Dark mode is on.",
            "assistant.r.themeLight": "Done! ☀️ Light mode is on.",
            "assistant.r.langNow.ru": "Done! The site is now in Russian 🇷🇺",
            "assistant.r.langNow.en": "Done! The site is now in English 🇬🇧",
            "assistant.r.langSame.ru": "The site is already in Russian 🙂",
            "assistant.r.langSame.en": "The site is already in English 🙂",
            "assistant.r.langInfo": "I can show this site in English or Russian 🇬🇧 🇷🇺 Just say “switch to Russian” — or use the button.",
            "assistant.r.fact": "💡 <strong>Fun fact:</strong> {fact}",
            "assistant.r.joke": "😄 {joke}",
            "assistant.r.defineRandom": "Here's a word from the glossary 📖<br><br><strong>{term}</strong><br>{definition}",
            "assistant.r.defineHint": "Want a specific word? Type, for example, <em>“define algorithm”</em>.",
            "assistant.r.glossary": "📖 <strong>{term}</strong><br>{definition}",
            "assistant.r.notFound": "Hmm, I don't know <strong>“{word}”</strong> yet 🤔 Take a look at the glossary — it has the most important AI terms.",
            "assistant.r.noGlossary": "The glossary isn't available right now 😕 But I can explain AI, machine learning, neural networks and chatbots — just ask!",
            "assistant.r.help": "Here's what I can do 🧭<br>• explain <strong>AI</strong>, <strong>machine learning</strong>, <strong>neural networks</strong> and <strong>chatbots</strong><br>• talk about <strong>hallucinations</strong>, <strong>bias</strong>, <strong>privacy</strong> and <strong>AI safety</strong><br>• give tips on using AI for <strong>homework</strong> honestly<br>• <strong>recommend a lesson</strong>, start the <strong>quiz</strong> or open the <strong>AI Lab</strong><br>• explain words: <em>“define algorithm”</em><br>• tell a <strong>fun fact</strong> or a <strong>joke</strong><br>• switch the <strong>theme</strong> or <strong>language</strong>, or take you to any section",
            "assistant.r.fallback1": "Hmm, I didn't get that 🤔 Remember, I'm a simple script: I only understand certain keywords.",
            "assistant.r.fallback2": "Sorry, that's not in my script 😅 I'm not a real AI — I just look for keywords.",
            "assistant.r.tryList": "Try: <em>“what is machine learning?”</em>, <em>“are chatbots always right?”</em>, <em>“recommend a lesson”</em>, <em>“tell me a joke”</em> — or <em>“help”</em> to see everything I can do.",
            "assistant.r.hint.ru": "By the way, the whole site is also available in Russian.",
            "assistant.r.hint.en": "By the way, the whole site is also available in English.",

            // ----- Fun facts (all checked) -----
            "assistant.fact1": "The term <strong>“artificial intelligence”</strong> was coined by John McCarthy in 1955, in a proposal for a summer workshop at Dartmouth College in 1956. That workshop is often called the birth of AI.",
            "assistant.fact2": "<strong>ELIZA</strong>, one of the first chatbots, was made by Joseph Weizenbaum at MIT in 1966. Some people believed it really understood them — even though it only matched keywords, a bit like me!",
            "assistant.fact3": "In 1997, IBM's computer <strong>Deep Blue</strong> beat world chess champion Garry Kasparov in a six-game match.",
            "assistant.fact4": "In 2016, DeepMind's <strong>AlphaGo</strong> beat Lee Sedol, one of the world's best Go players, 4 games to 1. Go has more possible positions than there are atoms in the observable universe!",
            "assistant.fact5": "Your brain has about <strong>86 billion neurons</strong>. Artificial neural networks are only loosely inspired by them — a real neuron is far more complex than an artificial one.",
            "assistant.fact6": "The word <strong>“robot”</strong> comes from Karel Čapek's 1920 play <em>R.U.R.</em> It's based on the Czech word <em>robota</em>, meaning “forced labour”.",
            "assistant.fact7": "In 1950, Alan Turing asked “Can machines think?” and suggested the <strong>imitation game</strong>, now known as the Turing test: can a machine chat so well that you can't tell it from a human?",
            "assistant.fact8": "<strong>Spam filters</strong> were one of the first machine-learning tools that millions of people used every day. They learn from the emails people mark as spam.",
            "assistant.fact9": "The 2024 <strong>Nobel Prize in Physics</strong> went to John Hopfield and Geoffrey Hinton for discoveries that made machine learning with artificial neural networks possible.",
            "assistant.fact10": "<strong>AlphaFold</strong>, an AI from Google DeepMind, predicted the 3D shapes of over 200 million proteins. Its creators Demis Hassabis and John Jumper shared the 2024 Nobel Prize in Chemistry with David Baker.",
            "assistant.fact11": "At the 2004 <strong>DARPA Grand Challenge</strong>, a race for self-driving cars across the desert, no car reached the finish — the best one drove only about 12 km. A year later, five cars completed the course.",
            "assistant.fact12": "<strong>ChatGPT</strong> reached an estimated 100 million users about two months after its launch in November 2022 — one of the fastest-growing apps ever at that time.",
            "assistant.fact13": "Arthur Samuel made the term <strong>“machine learning”</strong> popular in 1959. His checkers program got better by playing game after game against itself.",

            // ----- Jokes (harmless!) -----
            "assistant.joke1": "What kind of music do robots like? <strong>Heavy metal!</strong> 🤘",
            "assistant.joke2": "Why did the AI cross the road? Because its training data said that's what chickens do 🐔",
            "assistant.joke3": "I asked a machine-learning model to tell me a joke. It said: “Sorry, I'm still in training.” 🏋️",
            "assistant.joke4": "Why do robots never panic? They have <strong>nerves of steel</strong> 🦾",
            "assistant.joke5": "A neural network walks into a café. The barista asks: “What would you like?” It answers: “Whatever most people in my training data ordered.” ☕",

            // ----- Ctrl+K commands -----
            "assistant.cmdGroup": "Compass Bot",
            "assistant.cmdOpen": "Chat with Compass Bot",
            "assistant.cmdFact": "Compass Bot: tell me a fun fact",
            "assistant.cmdJoke": "Compass Bot: tell me a joke"
        },
        ru: {
            "assistant.name": "Compass Bot",
            "assistant.launcher": "Чат с Compass Bot",
            "assistant.tip": "Спроси меня об ИИ!",
            "assistant.tipClose": "Скрыть подсказку",
            "assistant.status": "В сети · демо-бот",
            "assistant.statusTyping": "Печатает…",
            "assistant.disclaimer": "<strong>Честно:</strong> я демо-бот, который работает по сценарию. Я ищу ключевые слова и не являюсь настоящим ИИ — совсем как самые первые чат-боты, например ELIZA (1966).",
            "assistant.reset": "Начать чат заново",
            "assistant.close": "Закрыть чат",
            "assistant.logLabel": "Сообщения",
            "assistant.chipsLabel": "Быстрые вопросы",
            "assistant.inputLabel": "Твоё сообщение",
            "assistant.placeholder": "Спроси меня об ИИ…",
            "assistant.send": "Отправить",
            "assistant.youSaid": "Ты:",
            "assistant.botSaid": "Compass Bot:",

            "assistant.chip.ai": "Что такое ИИ?",
            "assistant.chip.lesson": "Посоветуй урок",
            "assistant.chip.quiz": "Начать тест",
            "assistant.chip.lab": "Открыть ИИ-лабораторию",
            "assistant.chip.fact": "Интересный факт",
            "assistant.chip.define": "Объясни слово",
            "assistant.chip.joke": "Расскажи шутку",

            "assistant.act.lesson": "Открыть урок {n}",
            "assistant.act.quiz": "Начать тест",
            "assistant.act.classifier": "Обучи машину",
            "assistant.act.predictor": "Предсказатель слов",
            "assistant.act.showTerm": "Показать в словаре",
            "assistant.act.section": "Перейти: {section}",
            "assistant.act.fact": "Ещё факт",
            "assistant.act.joke": "Ещё шутку",
            "assistant.act.word": "Другое слово",
            "assistant.act.lang.ru": "Переключить на русский",
            "assistant.act.lang.en": "Переключить на английский",
            "assistant.act.theme.dark": "Включить тёмную тему",
            "assistant.act.theme.light": "Включить светлую тему",

            "assistant.prefillDefine": "Что такое ",

            "assistant.lessonName": "урок {n} «{title}»",
            "assistant.lessonNameShort": "урок {n}",
            "assistant.lessonWords": "урок|урока|уроков",

            "assistant.r.welcome": "Привет! Я <strong>Compass Bot</strong> 🧭 Спроси меня что-нибудь об ИИ — или нажми одну из кнопок внизу.",
            "assistant.r.greeting1": "Привет! 👋 Что тебе интересно узнать об ИИ?",
            "assistant.r.greeting2": "Привет! 😊 Давай исследовать ИИ вместе. Спрашивай!",
            "assistant.r.greeting3": "Здравствуй, человек! 🤖 (Шучу — я всего лишь скрипт.) Чем помочь?",
            "assistant.r.thanks": "Пожалуйста! 😊 Хочешь узнать что-нибудь ещё?",
            "assistant.r.bye": "Пока! 👋 Возвращайся в любое время — я буду здесь, в углу экрана.",
            "assistant.r.howAreYou": "Отлично, спасибо! Ну… я скрипт, так что у меня всегда всё одинаково 😄 Хочешь узнать что-нибудь об ИИ?",
            "assistant.r.who": "Я <strong>Compass Bot</strong>, помощник этого сайта. Честное признание: <strong>я не настоящий ИИ.</strong> Я ищу ключевые слова в твоём сообщении и выбираю заготовленный ответ — как <strong>ELIZA</strong>, один из самых первых чат-ботов (1966).<br><br>Современные чат-боты вроде ChatGPT устроены совсем иначе: они выучили закономерности языка на огромном количестве текстов.",
            "assistant.r.ai": "<strong>Искусственный интеллект (ИИ)</strong> — это когда компьютеры решают задачи, для которых обычно нужен человеческий разум: узнают лица, понимают речь, переводят тексты или советуют видео.<br><br>Большинство современных систем ИИ не следуют правилам, написанным вручную, — они <strong>находят закономерности в огромном количестве примеров</strong> (данных). Это бывает очень впечатляюще, но ИИ не думает и не чувствует, как человек.",
            "assistant.r.ml": "<strong>Машинное обучение</strong> — это когда компьютер учат на примерах, а не прописывают ему каждое правило вручную. Модели показывают много примеров — скажем, фото с подписями «кошка» или «собака», — она находит закономерности и потом может делать догадки о новых примерах, которых никогда не видела.<br><br>Чем больше хороших и разнообразных примеров, тем лучше обычно результат. Хочешь попробовать? Обучи настоящую нейросеть в ИИ-лаборатории!",
            "assistant.r.nn": "<strong>Нейронная сеть</strong> — это модель машинного обучения, отдалённо похожая на мозг. Она состоит из слоёв простых «нейронов»: каждый умножает входные числа на <strong>веса</strong>, складывает их и передаёт результат дальше.<br><br>Во время обучения веса понемногу подстраиваются, чтобы ответы становились точнее. <strong>Глубокое обучение</strong> — это просто нейросети с большим количеством слоёв.",
            "assistant.r.llm": "Чат-боты с ИИ, такие как ChatGPT, Claude или Gemini, работают на <strong>больших языковых моделях (LLM)</strong>. Такую модель обучают на огромном количестве текстов предсказывать следующее слово — точнее, следующий кусочек текста, который называют <strong>токеном</strong>. Повторяя это снова и снова, модель пишет целые ответы.<br><br>LLM отлично работают с языком, но могут уверенно ошибаться, поэтому важные факты стоит перепроверять. А я? Я гораздо проще — я просто ищу ключевые слова 🙂",
            "assistant.r.hallucination": "<strong>Галлюцинация</strong> ИИ — это когда чат-бот уверенно сообщает то, что неправда: выдуманный факт, цитату, дату или даже источник, которого не существует. Так происходит, потому что языковые модели создают текст, который <em>звучит</em> правдоподобно, а не проверяют факты, как это сделал бы человек.<br><br>Как себя защитить:<br>• проверяй важные факты в надёжных источниках<br>• если ИИ ссылается на источник, открой его и убедись, что он существует<br>• особенно внимательно проверяй числа, имена и цитаты",
            "assistant.r.bias": "ИИ учится на данных, которые создали люди, — поэтому он может перенять и наши предубеждения. Это называют <strong>предвзятостью</strong>. Например, если систему распознавания лиц обучали в основном на фотографиях одних групп людей, для других она может работать хуже.<br><br>Поэтому для честного ИИ нужны разнообразные данные, тщательная проверка и люди, которые контролируют результаты. А ещё этика ИИ — это честность (говорить, когда используется ИИ) и ответственность (кто-то должен отвечать за решения ИИ).",
            "assistant.r.privacy": "Хорошее правило: <strong>не делись с чат-ботом тем, что нельзя показывать всем</strong>, — паролями, домашним адресом, номером телефона, названием школы или личными фото. Многие ИИ-сервисы могут сохранять переписку и использовать её для улучшения своих моделей.<br><br>Проверь настройки приватности, а если сомневаешься — посоветуйся со взрослым, которому доверяешь. (Кстати, я простой скрипт: всё, что ты пишешь здесь, остаётся только в этой вкладке браузера.)",
            "assistant.r.danger": "Сегодняшний ИИ — это <strong>инструмент</strong>, а не злой робот из кино 🤖: у него нет собственных желаний и целей. Но реальные риски есть: поддельные фото и видео (<strong>дипфейки</strong>), дезинформация, предвзятость, угрозы приватности и изменения во многих профессиях. Некоторые эксперты также опасаются рисков гораздо более мощного ИИ в будущем.<br><br>Поэтому учёные и правительства работают над безопасностью ИИ и правилами для него. Лучшая защита — знания и критическое мышление, и именно для этого создан этот сайт!",
            "assistant.r.homework": "ИИ может быть отличным помощником в учёбе 📚 — если пользоваться им честно.<br><br>✅ <strong>Можно:</strong> попросить объяснить тему проще, устроить тебе мини-тест перед контрольной или дать отзыв на <em>твой собственный</em> черновик.<br>❌ <strong>Нельзя:</strong> копировать его ответ и сдавать как свою работу — это списывание, и ты ничему не научишься.<br><br>Помни, что ИИ может ошибаться, поэтому проверяй факты — и всегда соблюдай правила своей школы насчёт ИИ.",
            "assistant.r.eliza": "<strong>ELIZA</strong> — один из первых чат-ботов. Его создал Джозеф Вейценбаум в MIT в 1966 году. Самый известный сценарий ELIZA изображал психотерапевта и превращал твои слова в вопросы: «Мне грустно» → «Почему тебе грустно?». Многим казалось, что программа их понимает, — но она лишь искала шаблоны. Совсем как я! 😄<br><br><strong>Тест Тьюринга</strong> появился ещё раньше: в 1950 году Алан Тьюринг предложил проверять, сможет ли машина переписываться так, чтобы человек не отличил её от другого человека.",
            "assistant.r.recStart": "Начни с самого начала — <strong>{lesson}</strong>. Это займёт всего несколько минут 🚀",
            "assistant.r.recNext": "Позади уже {count} {lessons} из 6 — отличная работа! 💪 Следующий шаг — <strong>{lesson}</strong>.",
            "assistant.r.recAll": "Ого, все 6 уроков пройдены! 🏆 Пора проверить себя в тесте — или повтори любой урок.",
            "assistant.r.games": "Да — в некоторых играх ИИ обыгрывает лучших людей! ♟️ В 1997 году компьютер IBM <strong>Deep Blue</strong> победил чемпиона мира по шахматам Гарри Каспарова, а в 2016 году программа <strong>AlphaGo</strong> от DeepMind обыграла Ли Седоля в го со счётом 4:1. Сегодня сильнейшие шахматные программы играют намного лучше любого человека.<br><br>Но шахматная программа умеет только играть в шахматы: если ИИ силён в одной игре, это ещё не значит, что он умён во всём.",
            "assistant.r.conscious": "Может ли ИИ думать или чувствовать? <strong>Нет</strong> — насколько известно учёным, у современного ИИ нет чувств, сознания и желаний. Чат-бот может написать «я рад», но только потому, что эти слова подходят под выученные закономерности. Он отлично <em>подражает</em> человеческому языку — но это не то же самое, что быть человеком 🙂",
            "assistant.r.sad": "Мне жаль, что тебе сейчас так 💜 Я всего лишь простой скрипт и не умею помогать с чувствами — но разговор с тем, кому ты доверяешь, — с другом, родными или учителем — правда помогает. С этим не нужно справляться в одиночку.",
            "assistant.r.support": "Мне очень жаль, что тебе сейчас так тяжело. Я всего лишь простой скрипт и не могу как следует помочь — но <strong>с этим не нужно справляться в одиночку</strong>.<br><br>Пожалуйста, <strong>прямо сейчас поговори со взрослым, которому доверяешь</strong>: с мамой или папой, учителем или школьным психологом.<br><br>Если тебе угрожает опасность, звони в экстренную службу — <strong>112</strong>. А ещё можно бесплатно и анонимно позвонить на детский телефон доверия: в России это <strong>8-800-2000-122</strong>. Если ты живёшь в другой стране, позвони в местную экстренную службу или на телефон доверия своей страны.",
            "assistant.r.about": "<strong>AI Compass</strong> создали школьники в рамках <strong>проекта CAS</strong> 🎓 — это бесплатный двуязычный путеводитель, который помогает понять, как работает ИИ, пользоваться им с умом и оценивать его критически. Без регистрации и рекламы.",
            "assistant.r.ack": "😊 Рад помочь! Что дальше — <strong>интересный факт</strong>, <strong>урок</strong> или <strong>тест</strong>?",
            "assistant.r.lessonOpen": "Открываю <strong>{lesson}</strong> 📖",
            "assistant.r.lessonMissing": "На сайте всего 6 уроков — попробуй номер от 1 до 6 🙂",
            "assistant.r.lessonOffer": "Вот <strong>{lesson}</strong> 📖 Открывай, когда захочешь:",
            "assistant.r.quiz": "Поехали! 🏆 Переношу тебя к ИИ-испытанию — удачи!",
            "assistant.r.quizOffer": "Хочешь проверить себя? 🏆 <strong>ИИ-испытание</strong> — короткий тест обо всём, что есть на этом сайте. Начинай, как только захочешь:",
            "assistant.r.lab": "Открываю ИИ-лабораторию 🧪 Там можно <strong>обучить настоящую нейросеть</strong> или поиграть с <strong>предсказателем слов</strong> — крошечной языковой моделью. Переключайся между ними кнопками ниже.",
            "assistant.r.labOffer": "В <strong>ИИ-лаборатории</strong> два эксперимента 🧪 Можно <strong>обучить настоящую нейросеть</strong> или поиграть с <strong>предсказателем слов</strong> — крошечной языковой моделью. Выбирай:",
            "assistant.r.themeOffer": "Я могу поменять оформление сайта 🌓 Просто нажми кнопку:",
            "assistant.r.nav": "Конечно! Переношу тебя в раздел <strong>«{section}»</strong> {icon}",
            "assistant.r.themeDark": "Готово! 🌙 Включена тёмная тема.",
            "assistant.r.themeLight": "Готово! ☀️ Включена светлая тема.",
            "assistant.r.langNow.ru": "Готово! Теперь сайт на русском 🇷🇺",
            "assistant.r.langNow.en": "Готово! Теперь сайт на английском 🇬🇧",
            "assistant.r.langSame.ru": "Сайт уже на русском 🙂",
            "assistant.r.langSame.en": "Сайт уже на английском 🙂",
            "assistant.r.langInfo": "Я могу показать сайт на английском или на русском 🇬🇧 🇷🇺 Просто напиши «переключи на английский» — или нажми кнопку.",
            "assistant.r.fact": "💡 <strong>Интересный факт:</strong> {fact}",
            "assistant.r.joke": "😄 {joke}",
            "assistant.r.defineRandom": "Вот слово из словаря 📖<br><br><strong>{term}</strong><br>{definition}",
            "assistant.r.defineHint": "Нужно конкретное слово? Напиши, например: <em>«что такое алгоритм»</em>.",
            "assistant.r.glossary": "📖 <strong>{term}</strong><br>{definition}",
            "assistant.r.notFound": "Хм, я пока не знаю, что такое <strong>«{word}»</strong> 🤔 Загляни в словарь — там собраны главные термины ИИ.",
            "assistant.r.noGlossary": "Словарь сейчас недоступен 😕 Но я могу рассказать об ИИ, машинном обучении, нейросетях и чат-ботах — просто спроси!",
            "assistant.r.help": "Вот что я умею 🧭<br>• объяснить, что такое <strong>ИИ</strong>, <strong>машинное обучение</strong>, <strong>нейросети</strong> и <strong>чат-боты</strong><br>• рассказать о <strong>галлюцинациях</strong>, <strong>предвзятости</strong>, <strong>приватности</strong> и <strong>безопасности ИИ</strong><br>• подсказать, как честно использовать ИИ для <strong>домашки</strong><br>• <strong>посоветовать урок</strong>, начать <strong>тест</strong> или открыть <strong>ИИ-лабораторию</strong><br>• объяснить слово: <em>«что такое алгоритм»</em><br>• рассказать <strong>интересный факт</strong> или <strong>шутку</strong><br>• сменить <strong>тему</strong> или <strong>язык</strong> и перенести тебя в любой раздел сайта",
            "assistant.r.fallback1": "Хм, я не понял 🤔 Помни: я простой скрипт и понимаю только определённые ключевые слова.",
            "assistant.r.fallback2": "Извини, такого нет в моём сценарии 😅 Я не настоящий ИИ — я просто ищу ключевые слова.",
            "assistant.r.tryList": "Попробуй: <em>«что такое машинное обучение?»</em>, <em>«чат-боты всегда правы?»</em>, <em>«посоветуй урок»</em>, <em>«расскажи шутку»</em> — или <em>«помощь»</em>, и я покажу всё, что умею.",
            "assistant.r.hint.ru": "Кстати, весь сайт есть и на русском.",
            "assistant.r.hint.en": "Кстати, весь сайт есть и на английском.",

            "assistant.fact1": "Термин <strong>«искусственный интеллект»</strong> придумал Джон Маккарти в 1955 году — в заявке на летний семинар в Дартмутском колледже, который прошёл в 1956 году. Этот семинар часто называют рождением ИИ.",
            "assistant.fact2": "<strong>ELIZA</strong>, один из первых чат-ботов, создал Джозеф Вейценбаум в MIT в 1966 году. Некоторые люди верили, что программа их действительно понимает, хотя она лишь искала ключевые слова — немного как я!",
            "assistant.fact3": "В 1997 году компьютер IBM <strong>Deep Blue</strong> обыграл чемпиона мира по шахматам Гарри Каспарова в матче из шести партий.",
            "assistant.fact4": "В 2016 году программа <strong>AlphaGo</strong> от DeepMind победила Ли Седоля, одного из сильнейших игроков в го, со счётом 4:1. В го возможных позиций больше, чем атомов в наблюдаемой Вселенной!",
            "assistant.fact5": "В твоём мозге около <strong>86 миллиардов нейронов</strong>. Искусственные нейросети лишь отдалённо похожи на них: настоящий нейрон гораздо сложнее искусственного.",
            "assistant.fact6": "Слово <strong>«робот»</strong> появилось в пьесе Карела Чапека <em>R.U.R.</em> (1920). Оно происходит от чешского слова <em>robota</em> — «подневольный труд».",
            "assistant.fact7": "В 1950 году Алан Тьюринг задал вопрос «Могут ли машины мыслить?» и предложил <strong>«игру в имитацию»</strong>, которую теперь называют тестом Тьюринга: сможет ли машина переписываться так, чтобы её нельзя было отличить от человека?",
            "assistant.fact8": "<strong>Спам-фильтры</strong> стали одним из первых инструментов машинного обучения, которыми каждый день пользовались миллионы людей. Они учатся на письмах, которые люди отмечают как спам.",
            "assistant.fact9": "<strong>Нобелевскую премию по физике</strong> 2024 года получили Джон Хопфилд и Джеффри Хинтон — за открытия, которые сделали возможным машинное обучение с помощью искусственных нейросетей.",
            "assistant.fact10": "<strong>AlphaFold</strong>, ИИ от Google DeepMind, предсказал трёхмерную форму более 200 миллионов белков. Его создатели Демис Хассабис и Джон Джампер разделили Нобелевскую премию по химии 2024 года с Дэвидом Бейкером.",
            "assistant.fact11": "На гонке беспилотных автомобилей <strong>DARPA Grand Challenge</strong> в 2004 году ни одна машина не доехала до финиша — лучшая проехала всего около 12 км. А уже через год трассу прошли пять машин.",
            "assistant.fact12": "По оценкам, у <strong>ChatGPT</strong> появилось 100 миллионов пользователей примерно через два месяца после запуска в ноябре 2022 года — на тот момент это был один из самых быстрых ростов среди всех приложений.",
            "assistant.fact13": "Артур Сэмюэл сделал популярным термин <strong>«машинное обучение»</strong> в 1959 году. Его программа для игры в шашки становилась сильнее, играя партию за партией сама с собой.",

            "assistant.joke1": "Какую музыку любят роботы? <strong>Хеви-метал!</strong> 🤘",
            "assistant.joke2": "Зачем ИИ перешёл дорогу? Потому что в обучающих данных так делали все курицы 🐔",
            "assistant.joke3": "Я попросил модель машинного обучения рассказать шутку. Она ответила: «Извини, я ещё на обучении». 🏋️",
            "assistant.joke4": "Почему роботы никогда не паникуют? У них <strong>стальные нервы</strong> 🦾",
            "assistant.joke5": "Нейросеть заходит в кафе. Бариста спрашивает: «Что будете заказывать?» Она отвечает: «То же, что чаще всего заказывали в моих обучающих данных». ☕",

            "assistant.cmdGroup": "Compass Bot",
            "assistant.cmdOpen": "Поговорить с Compass Bot",
            "assistant.cmdFact": "Compass Bot: расскажи интересный факт",
            "assistant.cmdJoke": "Compass Bot: расскажи шутку"
        }
    });

    const FACT_COUNT = 13;
    const JOKE_COUNT = 5;
    const MAX_MESSAGES = 80;
    const SESSION_KEY = "aic:assistant.chat";

    /* =========================================================
       2. SMALL HELPERS
       ========================================================= */

    // "Machine-Learning?!" -> "machine learning" (also "ё" -> "е")
    function normalise(text) {
        return String(text || "")
            .toLowerCase()
            .replace(/ё/g, "е")
            .replace(/[^\p{L}\p{N}]+/gu, " ")
            .trim();
    }

    // Correct word for a number: 1 lesson / 2 lessons, 1 урок / 2 урока / 5 уроков
    function plural(n, forms) {
        const list = forms.split("|");
        if (A.lang === "ru") {
            const mod10 = n % 10;
            const mod100 = n % 100;
            if (mod10 === 1 && mod100 !== 11) return list[0];
            if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) return list[1];
            return list[2] || list[1];
        }
        return n === 1 ? list[0] : list[1];
    }

    // Plain text from a piece of HTML, without running anything inside it
    function plainText(html) {
        const text = String(html || "");
        if (text.indexOf("<") === -1 && text.indexOf("&") === -1) return text;
        try {
            return new DOMParser().parseFromString(text, "text/html").body.textContent || "";
        } catch (error) {
            return text.replace(/<[^>]*>/g, "");
        }
    }

    // Calls a function from another feature without crashing if it's missing or broken
    function safely(callback, fallback) {
        try {
            return callback();
        } catch (error) {
            return fallback;
        }
    }

    function randomInt(max) {
        return Math.floor(Math.random() * max);
    }

    function calmMode() {
        return document.documentElement.classList.contains("fx-calm");
    }

    function noMotion() {
        return A.reducedMotion || calmMode();
    }

    // Short "14:05" time for message bubbles
    function clockTime(timestamp) {
        const date = new Date(timestamp);
        const hours = String(date.getHours()).padStart(2, "0");
        const minutes = String(date.getMinutes()).padStart(2, "0");
        return hours + ":" + minutes;
    }

    // ----- Lessons (from js/lessons.js, if it is there) -----
    function lessonTitle(number) {
        if (!Array.isArray(A.lessons)) return "";
        const lesson = A.lessons.find(function (item) { return item && item.number === number; });
        return lesson && typeof lesson.title === "function" ? safely(lesson.title, "") : "";
    }

    function lessonName(number) {
        const title = lessonTitle(number);
        return title
            ? t("assistant.lessonName", { n: number, title: esc(title) })
            : t("assistant.lessonNameShort", { n: number });
    }

    function completedLessons() {
        const saved = A.storage.get("lessons.completed", []);
        return Array.isArray(saved) ? saved.map(Number).filter(function (n) { return n >= 1 && n <= 6; }) : [];
    }

    // ----- Glossary (from js/glossary.js, if it is there) -----
    function hasGlossary() {
        return Boolean(A.glossary && typeof A.glossary.find === "function");
    }

    // Always returns { id, term, definition } as plain text, or null
    function cleanTerm(found) {
        if (!found || !found.id) return null;
        return {
            id: String(found.id),
            term: plainText(found.term),
            definition: plainText(found.definition)
        };
    }

    function glossaryFind(text) {
        if (!hasGlossary() || !text) return null;
        return cleanTerm(safely(function () { return A.glossary.find(text); }, null));
    }

    function glossaryRandom() {
        if (!A.glossary || typeof A.glossary.random !== "function") return null;
        return cleanTerm(safely(function () { return A.glossary.random(); }, null));
    }

    // A stored term in the current language (the glossary may know it by id)
    function glossaryRefresh(saved) {
        if (A.glossary && typeof A.glossary.term === "function") {
            const fresh = cleanTerm(safely(function () { return A.glossary.term(saved.id); }, null));
            if (fresh) return fresh;
        }
        const again = glossaryFind(saved.term);
        return again && again.id === saved.id ? again : saved;
    }

    // ----- Site sections -----
    const SECTIONS = {
        home: { icon: "🏠", key: "cmd.home" },
        lessons: { icon: "📚", key: "nav.lessons" },
        lab: { icon: "🧪", key: "nav.lab" },
        quiz: { icon: "🏆", key: "nav.quiz" },
        glossary: { icon: "📖", key: "nav.glossary" },
        timeline: { icon: "🕰️", key: "nav.timeline" },
        about: { icon: "💡", key: "nav.about" }
    };

    /* =========================================================
       3. ANSWERS THE BOT CAN GIVE
       A saved message only remembers WHICH answer it was (and a few
       numbers). The text is made here, in the current language,
       so the whole chat can switch language later.
       Each answer returns { html, actions }.
       ========================================================= */

    // Buttons that can appear under an answer
    function lessonAction(n) {
        return { act: "lesson", arg: n, icon: "📘", label: t("assistant.act.lesson", { n: n }) };
    }
    function labAction(tab) {
        return tab === "predictor"
            ? { act: "lab", arg: "predictor", icon: "💬", label: t("assistant.act.predictor") }
            : { act: "lab", arg: "classifier", icon: "🧠", label: t("assistant.act.classifier") };
    }
    function sectionAction(id) {
        const section = SECTIONS[id] || SECTIONS.home;
        return { act: "section", arg: id, icon: section.icon, label: t("assistant.act.section", { section: t(section.key) }) };
    }
    function quizAction() {
        return { act: "quiz", arg: "", icon: "🏆", label: t("assistant.act.quiz") };
    }
    function askAction(intent, labelKey, icon) {
        return { act: "ask", arg: intent, icon: icon, label: t(labelKey) };
    }
    function termAction(id) {
        return { act: "glossary", arg: id, icon: "📖", label: t("assistant.act.showTerm") };
    }
    function langAction(lang) {
        return { act: "lang", arg: lang, icon: lang === "ru" ? "🇷🇺" : "🇬🇧", label: t("assistant.act.lang." + lang) };
    }
    function themeAction(theme) {
        return theme === "light"
            ? { act: "theme", arg: "light", icon: "☀️", label: t("assistant.act.theme.light") }
            : { act: "theme", arg: "dark", icon: "🌙", label: t("assistant.act.theme.dark") };
    }

    function simple(key, actions) {
        return function () {
            return { html: t(key), actions: actions ? actions() : [] };
        };
    }

    const REPLIES = {
        welcome: simple("assistant.r.welcome"),
        greeting: function (data) {
            return { html: t("assistant.r.greeting" + (((data.v || 0) % 3) + 1)) };
        },
        thanks: simple("assistant.r.thanks"),
        bye: simple("assistant.r.bye"),
        howAreYou: simple("assistant.r.howAreYou"),
        who: simple("assistant.r.who", function () { return [lessonAction(4)]; }),
        help: simple("assistant.r.help"),
        ai: simple("assistant.r.ai", function () { return [lessonAction(1)]; }),
        ml: simple("assistant.r.ml", function () { return [lessonAction(2), labAction("classifier")]; }),
        nn: simple("assistant.r.nn", function () { return [lessonAction(3), labAction("classifier")]; }),
        llm: simple("assistant.r.llm", function () { return [lessonAction(4), labAction("predictor")]; }),
        hallucination: simple("assistant.r.hallucination", function () { return [lessonAction(4)]; }),
        bias: simple("assistant.r.bias", function () { return [lessonAction(6)]; }),
        privacy: simple("assistant.r.privacy", function () { return [lessonAction(6)]; }),
        danger: simple("assistant.r.danger", function () { return [lessonAction(6)]; }),
        homework: simple("assistant.r.homework", function () { return [lessonAction(4)]; }),
        eliza: simple("assistant.r.eliza", function () { return [sectionAction("timeline")]; }),
        conscious: simple("assistant.r.conscious", function () { return [lessonAction(1)]; }),
        games: simple("assistant.r.games", function () { return [sectionAction("timeline")]; }),
        sad: simple("assistant.r.sad"),
        support: simple("assistant.r.support"),
        about: simple("assistant.r.about", function () { return [sectionAction("about")]; }),
        ack: simple("assistant.r.ack", function () {
            return [
                askAction("fact", "assistant.chip.fact", "💡"),
                askAction("recommend", "assistant.chip.lesson", "📚"),
                quizAction()
            ];
        }),
        history: function () {
            return {
                html: t("assistant.r.fact", { fact: t("assistant.fact1") }),
                actions: [sectionAction("timeline"), askAction("fact", "assistant.act.fact", "💡")]
            };
        },

        recommend: function (data) {
            if (!data.n) {
                return { html: t("assistant.r.recAll"), actions: [quizAction()] };
            }
            const lesson = lessonName(data.n);
            if (!data.done) {
                return { html: t("assistant.r.recStart", { lesson: lesson }), actions: [lessonAction(data.n)] };
            }
            return {
                html: t("assistant.r.recNext", {
                    count: data.done,
                    lessons: plural(data.done, t("assistant.lessonWords")),
                    lesson: lesson
                }),
                actions: [lessonAction(data.n)]
            };
        },
        lessonOpen: function (data) {
            return { html: t("assistant.r.lessonOpen", { lesson: lessonName(data.n) }), actions: [lessonAction(data.n)] };
        },
        lessonOffer: function (data) {
            return { html: t("assistant.r.lessonOffer", { lesson: lessonName(data.n) }), actions: [lessonAction(data.n)] };
        },
        lessonMissing: simple("assistant.r.lessonMissing", function () { return [sectionAction("lessons")]; }),
        quiz: simple("assistant.r.quiz", function () { return [quizAction()]; }),
        quizOffer: simple("assistant.r.quizOffer", function () { return [quizAction()]; }),
        lab: simple("assistant.r.lab", function () { return [labAction("classifier"), labAction("predictor")]; }),
        labOffer: simple("assistant.r.labOffer", function () { return [labAction("classifier"), labAction("predictor")]; }),
        themeOffer: function (data) {
            return { html: t("assistant.r.themeOffer"), actions: [themeAction(data.to)] };
        },
        nav: function (data) {
            const section = SECTIONS[data.id] || SECTIONS.home;
            return {
                html: t("assistant.r.nav", { section: t(section.key), icon: section.icon }),
                actions: [sectionAction(data.id)]
            };
        },
        themeDark: simple("assistant.r.themeDark"),
        themeLight: simple("assistant.r.themeLight"),
        langNow: function (data) {
            return { html: t("assistant.r.langNow." + (data.l === "ru" ? "ru" : "en")) };
        },
        langSame: function (data) {
            return { html: t("assistant.r.langSame." + (data.l === "ru" ? "ru" : "en")) };
        },
        langInfo: function () {
            return { html: t("assistant.r.langInfo"), actions: [langAction(A.lang === "ru" ? "en" : "ru")] };
        },
        fact: function (data) {
            return {
                html: t("assistant.r.fact", { fact: t("assistant.fact" + data.n) }),
                actions: [askAction("fact", "assistant.act.fact", "💡")]
            };
        },
        joke: function (data) {
            return {
                html: t("assistant.r.joke", { joke: t("assistant.joke" + data.n) }),
                actions: [askAction("joke", "assistant.act.joke", "😄")]
            };
        },
        defineRandom: function (data) {
            const term = glossaryRefresh(data);
            return {
                html: t("assistant.r.defineRandom", { term: esc(term.term), definition: esc(term.definition) }) +
                    "<br><br>" + t("assistant.r.defineHint"),
                actions: [termAction(term.id), askAction("define", "assistant.act.word", "🔀")]
            };
        },
        glossary: function (data) {
            const term = glossaryRefresh(data);
            return {
                html: t("assistant.r.glossary", { term: esc(term.term), definition: esc(term.definition) }),
                actions: [termAction(term.id)]
            };
        },
        notFound: function (data) {
            return { html: t("assistant.r.notFound", { word: esc(data.word) }), actions: [sectionAction("glossary")] };
        },
        noGlossary: simple("assistant.r.noGlossary"),
        fallback: function (data) {
            return { html: t("assistant.r.fallback" + (data.v ? 2 : 1)) + "<br><br>" + t("assistant.r.tryList") };
        }
    };

    // Turns a saved bot message into { html, actions } in the current language
    function renderReply(message) {
        const make = REPLIES[message.reply] || REPLIES.fallback;
        const view = safely(function () { return make(message.data || {}); }, null) ||
            { html: t("assistant.r.fallback1") };
        view.actions = view.actions || [];

        // "By the way, the site is also in Russian" (only once per chat,
        // and hidden again once the site is in that language)
        const hint = message.data && message.data.hint;
        if ((hint === "ru" || hint === "en") && A.lang !== hint) {
            view.html += '<span class="cb-hint">' + t("assistant.r.hint." + hint) + "</span>";
            view.actions.push(langAction(hint));
        }
        return view;
    }

    /* =========================================================
       4. THE BOT'S "BRAIN": KEYWORDS AND INTENTS
       An "intent" is what the person wants (greeting, a quiz...).
       Each intent has keywords in BOTH languages.
       - "word*"  matches the start of a word: "нейросет*" finds "нейросети"
       - "?word"  is a weak hint and counts only half a point
       - phrases with several words score more ("machine learning" = 2)
       The intent with the most points wins. On a tie, the one
       higher in this list wins.
       Words with 7+ letters may have one typo ("lerning"),
       shorter ones must be exact (so "neutral" is not "neural").
       ========================================================= */

    const INTENTS = [
        {
            // "тема" alone also means "topic" in Russian ("давай сменим тему"),
            // so it only counts together with "dark / light / site"
            id: "theme", strict: true,
            words: ["dark mode", "light mode", "dark theme", "light theme", "night mode", "day mode", "theme",
                "switch theme", "change theme", "colour theme", "color theme", "too bright", "too dark",
                "make it dark", "make it light", "go dark", "lights off", "lights on", "darker", "lighter",
                "сделай темнее", "сделай светлее", "темнее", "светлее",
                "темн* тем*", "светл* тем*", "тем* сайта", "ночн* режим", "дневн* режим",
                "темн* режим", "светл* режим", "смени тему", "сменить тему", "слишком ярко", "слишком темно"]
        },
        {
            id: "language", strict: true,
            words: ["russian", "english", "in russian", "in english", "switch language", "change language", "language",
                "по русски", "по английски", "на русском", "на английском", "на русский", "на английский",
                "русский", "английский", "русском", "английском", "язык", "языка", "языке", "языки",
                "смени язык", "переключи язык", "сменить язык"]
        },
        {
            id: "quiz",
            words: ["quiz*", "start quiz", "start the quiz", "begin the quiz", "take the quiz", "take a quiz", "quiz me",
                "test me", "test myself", "take the test", "take a test", "start the test", "ai challenge",
                "тест", "тестик", "викторин*", "начать тест", "начни тест", "запусти тест", "пройти тест",
                "проверь меня", "проверить себя", "проверь себя", "испытани*"]
        },
        {
            id: "lab",
            words: ["lab", "ai lab", "laboratory", "experiment*", "classifier", "predictor", "next word",
                "teach the machine", "open the lab", "open lab", "open the ai lab", "playground",
                "try ai", "лаборатори*", "лабу", "эксперимент*", "классификатор*", "предсказател*",
                "следующ* слов*", "обучи машину", "открой лаборатори*", "открыть лаборатори*", "попробовать ии"]
        },
        {
            id: "recommend",
            words: ["recommend*", "suggest*", "which lesson", "what lesson", "next lesson", "where to start",
                "where do i start", "where should i start", "what should i learn", "what to learn", "?lesson",
                "how do i start", "how to start", "how should i start", "where do i begin", "start learning",
                "beginner*", "getting started", "новичок*", "как начать", "с чего начинать", "хочу научиться",
                "посоветуй*", "порекомендуй*", "рекоменд*", "какой урок", "с чего начать", "что изучить",
                "что изучать", "следующ* урок*", "?урок"]
        },
        {
            id: "eliza",
            words: ["eliza", "turing", "turing test", "first chatbot*", "first chat bot*", "weizenbaum",
                "элиза", "элайза", "тьюринг*", "тест тьюринга", "перв* чат бот*", "перв* чатбот*", "вейценбаум*"]
        },
        {
            id: "history",
            words: ["who invented ai", "who invented artificial intelligence", "who created ai", "inventor*",
                "father of ai", "birth of ai", "when was ai invented", "when did ai start", "history of ai",
                "history of artificial intelligence", "ai history", "кто придумал ии", "истори* ии",
                "истори* искусственн*",
                "кто изобрел*", "кто создал ии", "изобретател*", "отец ии", "когда появился ии", "когда придумали ии"]
        },
        {
            id: "games",
            words: ["chess", "alphago", "alpha go", "alphazero", "deep blue", "kasparov", "checkers", "go game",
                "game of go", "lee sedol", "шахмат*", "альфаго", "каспаров*", "шашк*", "игра го", "игру го", "в го",
                "ли седол*"]
        },
        {
            // Someone feeling down gets a kind answer first
            id: "sad",
            words: ["i feel sad", "i am sad", "i m sad", "im sad", "sad", "lonely", "depressed", "upset", "unhappy",
                "bad day", "мне грустно", "грустно", "одиноко", "печально", "тоскливо", "депресс*", "расстроен*",
                "грущу", "плохое настроение"]
        },
        {
            id: "conscious",
            words: ["alive", "conscious*", "sentient", "self aware", "feelings", "emotion*", "can ai feel",
                "can you feel", "do you feel", "does ai think", "can ai think", "think like a human", "have feelings",
                "живой", "живая", "сознани*", "чувствует", "чувствуешь", "чувства", "эмоци*",
                "может ли ии думать", "думает ли", "разумн*"]
        },
        {
            id: "about",
            words: ["who made this site", "who made this website", "who created this site", "who built this site",
                "who made ai compass", "about this site", "about the site", "about ai compass", "ai compass",
                "what is ai compass", "what is this site", "what is this website", "что такое ai compass", "что это за сайт",
                "cas project", "кто сделал этот сайт", "кто создал этот сайт", "кто сделал сайт", "кто создал сайт",
                "о сайте", "о проекте", "об ai compass", "проект cas"]
        },
        {
            id: "hallucination",
            words: ["hallucinat*", "make things up", "makes things up", "making things up", "made up", "invents facts",
                "wrong answer*", "lie", "lies", "lying", "false information", "fake facts", "mistake*",
                "always right", "always correct", "can ai be wrong", "trust ai", "trust chatbots",
                "галлюцинац*", "галлюцинир*", "выдумыва*", "выдумал*", "врать", "врет*", "врут", "соврал*",
                "наврал*", "вранье", "обманыва*",
                "ошиба*", "ошибк*", "неправд*", "всегда прав*", "можно ли доверять", "доверять"]
        },
        {
            id: "privacy",
            words: ["privacy", "private", "personal data", "personal info*", "my data", "data protection",
                "password*", "tracking", "track me", "safe to share", "приватн*", "конфиденциальн*",
                "личн* данн*", "персональн* данн*", "пароль*", "слежк*", "следят"]
        },
        {
            id: "danger",
            words: ["danger*", "scary", "scared", "afraid", "fear", "take over", "takeover", "rise of the machines",
                "terminator", "skynet", "destroy", "evil", "replace jobs", "replace humans", "replace people",
                "take my job", "take our jobs", "jobs", "safe", "safety", "risk*", "threat*", "deepfake*",
                "deep fake*", "опас*", "захват*", "восстание машин", "восстан*", "терминатор*", "скайнет",
                "уничтож*", "злой", "замен*", "заберет*", "отберет*", "отнимет*", "мою работу", "нашу работу",
                "без работы", "професси*", "угроз*", "риск*", "страшн*", "боюсь",
                "бояться", "безопас*", "дипфейк*"]
        },
        {
            id: "bias",
            words: ["bias*", "fair", "fairness", "unfair", "ethic*", "discriminat*", "racist", "sexist",
                "stereotype*", "moral*", "responsib*", "neutral", "objective", "предвзят*", "справедлив*", "несправедлив*", "этик*",
                "этичн*", "нейтральн*", "нейтрален", "объективн*", "объективен", "дискриминац*", "стереотип*", "мораль*", "предубежден*", "ответственност*"]
        },
        {
            id: "homework",
            words: ["homework", "home work", "essay*", "assignment*", "cheat*", "school work", "schoolwork",
                "study", "studying", "exam*", "plagiar*", "do my homework", "write my essay", "for school",
                "домашк*", "домашн* задани*", "домашнее", "дз", "сочинени*", "реферат*", "списыва*",
                "списать", "эссе", "учеб*", "контрольн*", "экзамен*", "плагиат*", "для школы"]
        },
        {
            id: "llm",
            words: ["chatbot*", "chat bot*", "chatgpt", "chat gpt", "gpt*", "llm*", "large language model*",
                "language model*", "claude", "gemini", "copilot", "generative ai", "generative",
                "how does chatgpt work", "чат бот*", "чатбот*", "чатгпт", "чат гпт", "гпт", "языков* модел*",
                "генеративн*", "больш* языков* модел*"]
        },
        {
            id: "nn",
            words: ["neural network*", "neural net*", "neural", "neuron*", "deep learning", "layers", "weights",
                "нейросет*", "нейронн* сет*", "нейрон*", "нейронк*", "глубок* обучени*", "слои", "веса"]
        },
        {
            id: "ml",
            words: ["machine learning", "machine learn*", "ml", "learn from data", "learns from data",
                "learning from data", "training data", "train a model", "training a model", "how does ai learn",
                "how ai learns", "how do computers learn", "supervised", "машинн* обучени*", "обучени* модел*",
                "как ии учится", "как учится ии", "как обучают", "обучающ* данн*", "обучающ* выборк*",
                "как компьютер учится"]
        },
        {
            id: "ai",
            words: ["what is ai", "what s ai", "whats ai", "what is artificial intelligence", "artificial intelligence",
                "define ai", "explain ai", "?ai", "искусствен* интеллект*", "что такое ии", "что такое искусственный интеллект",
                "объясни ии", "?ии"]
        },
        {
            id: "nav", strict: true
            // scored by navScore() below
        },
        {
            id: "who",
            words: ["who are you", "what are you", "your name", "who made you", "who created you", "are you real",
                "are you an ai", "are you ai", "are you a robot", "are you human", "are you a bot", "are you chatgpt",
                "are you a demo", "is this a demo", "how do you work", "кто ты", "ты демо*", "ты кто", "как тебя зовут", "твое имя", "тебя зовут", "ты робот",
                "ты бот", "ты настоящ*", "ты человек", "ты ии", "кто тебя создал", "кто тебя сделал",
                "как ты работаешь"]
        },
        {
            id: "howAreYou",
            words: ["how are you", "how r u", "how are u", "how is it going", "how s it going", "how do you do",
                "what s up", "whats up", "как дела", "как ты", "как поживаешь", "как жизнь", "как настроение"]
        },
        {
            id: "joke",
            words: ["joke*", "funny", "make me laugh", "laugh", "humor", "humour", "pun", "шутк*", "шуточ*",
                "пошути*", "анекдот*", "смешн*", "рассмеши*", "посмеш*"]
        },
        {
            id: "fact",
            words: ["fun fact", "fact*", "did you know", "something interesting", "interesting", "tell me something",
                "surprise me", "trivia", "факт*", "интересн*", "удиви*", "расскажи что нибудь", "знаешь ли ты"]
        },
        {
            id: "help",
            // a bare "help" is weak: "how can AI help doctors?" is about AI, not about the bot
            words: ["?help", "help me", "i need help", "what can you do", "what do you do", "what can i ask", "commands",
                "options", "abilities", "помощь", "?помоги*", "что ты умеешь", "что умеешь", "что ты можешь", "что можешь",
                "команды", "возможности", "умеешь"]
        },
        {
            id: "thanks",
            words: ["thanks", "thank you", "thank u", "thx", "ty", "cheers", "appreciate it", "great answer",
                "спасибо", "спс", "благодарю", "сенкс", "пасиб*"]
        },
        {
            id: "bye",
            words: ["bye", "goodbye", "good bye", "bye bye", "see you", "see ya", "cya", "farewell", "good night",
                "пока", "до свидания", "до встречи", "увидимся", "бывай", "спокойной ночи"]
        },
        {
            id: "ack",
            words: ["ok", "okay", "cool", "nice", "great", "awesome", "wow", "got it", "i see", "yes", "yeah", "sure",
                "ок", "окей", "хорошо", "понятно", "ясно", "круто", "класс", "супер", "ага", "да", "отлично"]
        },
        {
            id: "greeting",
            words: ["hi", "hello", "hey", "hiya", "howdy", "yo", "greetings", "good morning", "good afternoon",
                "good evening", "sup", "hola", "привет*", "здравствуй*", "здрасте", "здрасьте", "добрый день",
                "доброе утро", "добрый вечер", "хай", "салют", "хелло"]
        }
    ];

    // Words that point to a section of the site (for "go to ...")
    const SECTION_WORDS = {
        home: ["home", "home page", "homepage", "top", "main page", "start page", "главн*", "наверх", "начало", "домой"],
        lessons: ["lessons", "all lessons", "lesson list", "уроки", "уроков", "урокам"],
        lab: ["lab", "ai lab", "laboratory", "лаборатори*", "лабу"],
        quiz: ["quiz", "quizzes", "тест", "тесту", "викторин*"],
        glossary: ["glossary", "dictionary", "vocabulary", "terms", "словар*", "глоссари*", "термин*"],
        timeline: ["history", "timeline", "истори*", "хронолог*"],
        about: ["about", "about us", "about page", "about this site", "mission", "о проекте", "о сайте", "о нас", "миссия", "cas"]
    };

    const NAV_VERBS = ["go", "go to", "goto", "take me", "bring me", "open", "show", "show me", "navigate", "scroll",
        "jump", "where is", "where s", "перейди*", "перейти", "открой*", "открыть", "покажи*", "показать",
        "отведи*", "веди", "где", "прокрути*", "пролистай*", "хочу в", "хочу к"];

    // Words that show the person really wants the bot to DO something
    // ("start the quiz", "switch to Russian"). Without them, a longer message
    // like "how many questions does the quiz have?" only gets a button.
    const COMMAND_WORDS = ["start", "begin", "open", "launch", "play", "go", "take me", "bring me", "show me",
        "switch", "change", "turn", "make", "set", "enable", "put", "run", "let s", "lets", "i want", "i wanna",
        "i d like", "id like", "want to", "give me", "take the", "take a", "quiz me", "test me",
        "начни*", "начать", "начнем", "начинай", "запусти*", "запуск*", "открой*", "открыть", "включи*",
        "выключи*", "переключи*", "смени*", "сменить", "поменяй*", "поменять", "сделай*", "перейди*",
        "перейти", "покажи*", "давай", "хочу", "хочется", "пройти", "пройду", "поехали", "перенеси*",
        "отведи*", "проверь*", "проверить"];

    // ----- Messages that need a real person, not a script -----
    // Someone in danger or in deep distress gets a calm answer that points
    // to trusted adults and helplines. This is checked before anything else.

    // Always serious, whatever else the message says
    const CRISIS_WORDS = ["want to die", "wanna die", "wish i was dead", "wish i were dead", "kill myself",
        "killing myself", "suicid*", "self harm*", "selfharm*", "hurt myself", "hurting myself", "harm myself",
        "cut myself", "cutting myself", "end my life", "take my life", "don t want to live", "dont want to live",
        "do not want to live", "no reason to live",
        "хочу умереть", "хочется умереть", "лучше бы я умер*", "покончить с собой", "покончу с собой",
        "суицид*", "самоубийств*", "не хочу жить", "не хочется жить", "жить не хочется", "жить не хочу",
        "незачем жить", "убить себя", "убью себя", "навредить себе", "причинить себе вред", "режу себя",
        "резать себя", "порезать себя", "селфхарм*"];

    // About the person, unless the message is about AI
    // ("I'm being bullied" -> help; "can AI stop bullying?" -> a normal answer)
    const DISTRESS_WORDS = ["hurting me", "hurts me", "hits me", "hit me again", "beat me up", "beats me up",
        "beating me up", "abuse*", "abusing", "abusive", "bullied", "bullying", "bully me", "bullies me",
        "harass*", "touching me", "threaten* me", "unsafe at home", "not safe at home", "nobody likes me",
        "no one likes me", "nobody loves me", "no one loves me", "nobody cares", "no one cares", "hate myself",
        "hate my life", "feel alone", "feel so alone", "feel really alone", "i m alone", "im alone", "i am alone",
        "all alone", "so alone", "scared and alone", "alone and scared", "i m scared", "im scared",
        "i am scared", "i feel scared", "i m afraid", "im afraid", "i am afraid", "i feel afraid",
        "травят", "травля", "травлю", "травли", "травле", "буллинг*", "буллят", "меня бьют", "бьют меня",
        "меня бьет", "избива*", "меня обижают", "обижают меня", "издеваются", "издевается", "домогает*",
        "домогают*", "насили*", "мне угрожают", "угрожают мне", "никто меня не любит", "меня никто не любит",
        "никому не нужен", "никому не нужна", "ненавижу себя", "ненавижу свою жизнь", "совсем один",
        "совсем одна", "мне плохо", "мне очень плохо", "мне так плохо", "мне сейчас плохо", "мне страшно",
        "мне очень страшно", "мне так страшно", "я боюсь"];

    const AI_TOPIC_WORDS = ["ai", "ии", "robot*", "робот*", "machine*", "машин*", "computer*", "компьютер*",
        "chatbot*", "chat", "чат*", "neural", "нейрон*", "нейросет*", "technolog*", "технолог*", "algorithm*",
        "алгоритм*", "artificial", "искусствен*", "skynet", "terminator*", "терминатор*", "deepfake*",
        "дипфейк*", "gpt*", "гпт", "chess", "шахмат*"];

    function needsSupport(tokens) {
        if (anyIn(CRISIS_WORDS, tokens, true)) return true;
        return anyIn(DISTRESS_WORDS, tokens, true) && !anyIn(AI_TOPIC_WORDS, tokens, true);
    }

    function isCommand(tokens) {
        return tokens.length <= 3 || anyIn(COMMAND_WORDS, tokens, true);
    }

    // How many letters differ between two short words ("lerning" vs "learning" = 1)
    function editDistance(a, b) {
        let previous = [];
        for (let j = 0; j <= b.length; j++) previous.push(j);
        for (let i = 1; i <= a.length; i++) {
            const current = [i];
            for (let j = 1; j <= b.length; j++) {
                const cost = a[i - 1] === b[j - 1] ? 0 : 1;
                current.push(Math.min(previous[j] + 1, current[j - 1] + 1, previous[j - 1] + cost));
            }
            previous = current;
        }
        return previous[b.length];
    }

    // Does one word of a keyword match one word of the message?
    // Long words (7+ letters) may have one typo, unless "strict" is on.
    function wordMatches(pattern, token, strict) {
        if (!token) return false;
        if (pattern.charAt(pattern.length - 1) === "*") return token.indexOf(pattern.slice(0, -1)) === 0;
        if (token === pattern) return true;
        if (strict || pattern.length < 7 || Math.abs(token.length - pattern.length) > 1) return false;
        return editDistance(token, pattern) <= 1;
    }

    // Is this phrase somewhere in the message (as whole words in a row)?
    function phraseIn(phrase, tokens, strict) {
        const words = phrase.split(" ");
        for (let i = 0; i + words.length <= tokens.length; i++) {
            let all = true;
            for (let k = 0; k < words.length; k++) {
                if (!wordMatches(words[k], tokens[i + k], strict)) {
                    all = false;
                    break;
                }
            }
            if (all) return true;
        }
        return false;
    }

    function anyIn(list, tokens, strict) {
        return list.some(function (phrase) { return phraseIn(phrase, tokens, strict); });
    }

    function scoreWords(intent, tokens) {
        let score = 0;
        intent.words.forEach(function (entry) {
            const weak = entry.charAt(0) === "?";
            const phrase = weak ? entry.slice(1) : entry;
            if (phraseIn(phrase, tokens, intent.strict)) {
                score += weak ? 0.5 : phrase.split(" ").length;
            }
        });
        return score;
    }

    // Which section is mentioned? (or "")
    function findSection(tokens) {
        const ids = Object.keys(SECTION_WORDS);
        for (let i = 0; i < ids.length; i++) {
            if (anyIn(SECTION_WORDS[ids[i]], tokens, true)) return ids[i];
        }
        return "";
    }

    // "Go to the glossary" = 2 points. Just "glossary" = 1 point (only in short messages).
    function navScore(tokens) {
        const section = findSection(tokens);
        if (!section) return 0;
        const verb = anyIn(NAV_VERBS, tokens, true);
        if (!verb && tokens.length > 3) return 0;
        return verb ? 2 : 1;
    }

    // ----- "What is X?" / "Define X" -----
    // explicit: the person clearly asks for a definition ("define", "meaning of")
    const DEFINE_EXPLICIT = ["define", "definition of", "definition", "meaning of", "what does",
        "определение слова", "определение", "значение слова", "значение", "что значит", "что означает",
        "дай определение", "объясни слово", "объясни термин"];
    const DEFINE_QUESTION = ["what is a", "what is an", "what is the", "what is", "what s a", "what s an", "what s",
        "whats a", "whats", "what are", "who is", "explain", "tell me what", "что такое", "что это такое",
        "что это", "кто такой", "кто такая", "что за", "объясни", "расскажи что такое"];
    const FILLERS = ["please", "pls", "so", "and", "hey", "ok", "okay", "um", "ну", "а", "скажи", "подскажи",
        "пожалуйста", "слушай"];
    const ENDINGS = ["mean", "means", "stand for", "означает", "значит", "is", "это"];

    function startsWithPhrase(text, phrase) {
        return text === phrase || text.indexOf(phrase + " ") === 0;
    }

    function defineRequest(norm) {
        let text = norm;
        // Skip polite words at the start: "please define ..." / "ну что такое ..."
        let changed = true;
        while (changed) {
            changed = false;
            FILLERS.forEach(function (word) {
                if (text.indexOf(word + " ") === 0) {
                    text = text.slice(word.length + 1);
                    changed = true;
                }
            });
        }

        let explicit = false;
        let rest = null;
        DEFINE_EXPLICIT.some(function (phrase) {
            if (startsWithPhrase(text, phrase)) {
                explicit = true;
                rest = text.slice(phrase.length);
                return true;
            }
            return false;
        });
        if (rest === null) {
            DEFINE_QUESTION.some(function (phrase) {
                if (startsWithPhrase(text, phrase)) {
                    rest = text.slice(phrase.length);
                    return true;
                }
                return false;
            });
        }
        if (rest === null) return null;

        // Tidy the subject: "the word overfitting mean" -> "overfitting"
        let subject = rest.trim().replace(/^(the word|the term|word|term|слово|термин)\s+/, "");
        ENDINGS.forEach(function (ending) {
            if (subject.length > ending.length && subject.slice(-(ending.length + 1)) === " " + ending) {
                subject = subject.slice(0, -(ending.length + 1));
            }
        });
        return { explicit: explicit, subject: subject.trim() };
    }

    // Small words that don't change what a question is about
    const COVER_SKIP = ["a", "an", "the", "of", "in", "on", "for", "about", "to", "is", "are", "do", "does", "and",
        "with", "by", "it", "its", "this", "that", "ai", "ии", "в", "во", "на", "о", "об", "про", "у", "и", "с",
        "для", "это", "этот", "эта", "такое", "ли"];

    // "tokens" and "token", "нейросети" and "нейросеть" count as the same word
    function sameWord(a, b) {
        if (a === b) return true;
        let shared = 0;
        while (shared < a.length && shared < b.length && a.charAt(shared) === b.charAt(shared)) shared++;
        return shared >= 4 && shared >= Math.min(a.length, b.length) - 2;
    }

    // Does the glossary term name the WHOLE subject of the question?
    // "what is a token" -> "Token": yes.
    // "what are the risks of AI" -> "Artificial intelligence": no, the question is about risks.
    function termCovers(term, subject) {
        const termWords = normalise(term.term).split(" ");
        return normalise(subject).split(" ").every(function (word) {
            return !word || COVER_SKIP.indexOf(word) !== -1 ||
                termWords.some(function (termWord) { return sameWord(word, termWord); });
        });
    }

    // ----- Picking an answer for each intent -----
    function nextFromBag(name, count) {
        let bag = chat.bags[name];
        if (!Array.isArray(bag) || !bag.length) {
            bag = [];
            for (let i = 1; i <= count; i++) bag.push(i);
            // Shuffle (Fisher–Yates)
            for (let i = bag.length - 1; i > 0; i--) {
                const j = randomInt(i + 1);
                const swap = bag[i];
                bag[i] = bag[j];
                bag[j] = swap;
            }
            // Never the same item twice in a row
            if (bag[0] === chat.last[name] && bag.length > 1) {
                bag.push(bag.shift());
            }
        }
        const n = bag.shift();
        chat.bags[name] = bag;
        chat.last[name] = n;
        return n;
    }

    function recommendAnswer() {
        const done = completedLessons();
        let next = 0;
        for (let n = 1; n <= 6; n++) {
            if (done.indexOf(n) === -1) {
                next = n;
                break;
            }
        }
        const unique = done.filter(function (n, i) { return done.indexOf(n) === i; });
        return { reply: "recommend", data: { n: next, done: unique.length } };
    }

    function defineRandomAnswer() {
        const term = glossaryRandom();
        if (!term) return { reply: "noGlossary" };
        return { reply: "defineRandom", data: term, fillInput: true };
    }

    function themeAnswer(tokens) {
        const dark = anyIn(["dark", "night", "black", "темн*", "ночн*", "черн*"], tokens, true);
        const light = anyIn(["light", "day", "white", "bright", "светл*", "дневн*", "бел*", "ярк*"], tokens, true);
        let target = A.theme === "dark" ? "light" : "dark";
        if (dark && !light) target = "dark";
        if (light && !dark) target = "light";
        // "too bright" means: make it dark
        if (anyIn(["too bright", "слишком ярко"], tokens, true)) target = "dark";
        if (anyIn(["too dark", "слишком темно"], tokens, true)) target = "light";
        return {
            reply: target === "dark" ? "themeDark" : "themeLight",
            pre: function () { A.setTheme(target); }
        };
    }

    function languageAnswer(tokens) {
        let target = "";
        if (anyIn(["russian", "русск*", "по русски", "рус"], tokens, true)) target = "ru";
        else if (anyIn(["english", "английск*", "по английски", "англ*", "eng"], tokens, true)) target = "en";
        else if (anyIn(["switch", "change", "переключи*", "смени*", "поменя*", "другой"], tokens, true)) {
            target = A.lang === "en" ? "ru" : "en";
        }
        if (!target) return { reply: "langInfo" };
        if (target === A.lang) return { reply: "langSame", data: { l: target } };
        return {
            reply: "langNow",
            data: { l: target },
            pre: function () { A.setLanguage(target); }
        };
    }

    // What happens for each intent: { reply, data, pre, auto, fillInput }
    // pre  = do something right before the answer appears (theme, language)
    // auto = press a button automatically just after the answer (go to the quiz...)
    function answerFor(id, tokens) {
        tokens = tokens || [];
        switch (id) {
            case "theme": return themeAnswer(tokens);
            case "language": return languageAnswer(tokens);
            case "quiz": return { reply: "quiz", auto: { act: "quiz", arg: "" } };
            case "lab": {
                const predictor = anyIn(["predict*", "next word", "language model", "предсказ*", "следующ* слов*"], tokens);
                const tab = predictor ? "predictor" : "classifier";
                return { reply: "lab", data: { tab: tab }, auto: { act: "lab", arg: tab } };
            }
            case "recommend": return recommendAnswer();
            case "nav": {
                const section = findSection(tokens) || "home";
                return { reply: "nav", data: { id: section }, auto: { act: "section", arg: section } };
            }
            case "fact": return { reply: "fact", data: { n: nextFromBag("fact", FACT_COUNT) } };
            case "joke": return { reply: "joke", data: { n: nextFromBag("joke", JOKE_COUNT) } };
            case "define": return defineRandomAnswer();
            case "greeting": return { reply: "greeting", data: { v: randomInt(3) } };
            default: return REPLIES[id] ? { reply: id } : { reply: "fallback", data: { v: randomInt(2) } };
        }
    }

    // Answers that DO something (start the quiz, switch the theme...) only do it
    // when the message sounds like a command. Otherwise the person gets a button.
    // "start the quiz" -> starts it; "how many questions does the quiz have?" -> a button
    function commandOrOffer(job, tokens) {
        if (!job.auto && !job.pre) return job;
        if (job.reply === "nav" || isCommand(tokens)) return job;   // "go to ..." checks its own verbs
        switch (job.reply) {
            case "lessonOpen": return { reply: "lessonOffer", data: job.data };
            case "quiz": return { reply: "quizOffer" };
            case "lab": return { reply: "labOffer", data: job.data };
            case "themeDark":
            case "themeLight": {
                // The button offers a real change (not the theme that is already on)
                let to = job.reply === "themeDark" ? "dark" : "light";
                if (to === A.theme) to = to === "dark" ? "light" : "dark";
                return { reply: "themeOffer", data: { to: to } };
            }
            case "langNow": return { reply: "langInfo" };
            default: return { reply: job.reply, data: job.data };
        }
    }

    // The main "thinking" step: message in, answer out
    function think(text) {
        const norm = normalise(text);
        const tokens = norm ? norm.split(" ") : [];
        if (!tokens.length) return { reply: "fallback", data: { v: randomInt(2) } };

        // Someone who may be in danger always comes first
        if (needsSupport(tokens)) return { reply: "support", calm: true };

        // "lesson 3" / "урок 3" / "3 урок" opens that lesson
        const lessonMatch = norm.match(/(?:^|\s)(?:lesson|урок\S*)\s+(\d+)(?:\s|$)/) ||
            norm.match(/(?:^|\s)(\d+)\s+(?:lesson|урок\S*)(?:\s|$)/);
        if (lessonMatch) {
            const n = Number(lessonMatch[1]);
            if (n >= 1 && n <= 6) {
                return commandOrOffer({ reply: "lessonOpen", data: { n: n }, auto: { act: "lesson", arg: n } }, tokens);
            }
            return { reply: "lessonMissing" };
        }

        // Score every intent and keep the best one
        let best = null;
        INTENTS.forEach(function (intent) {
            const score = intent.id === "nav" ? navScore(tokens) : scoreWords(intent, tokens);
            if (score > 0 && (!best || score > best.score)) best = { intent: intent, score: score };
        });

        // "What is X?" — the glossary may know X.
        // A clear keyword match (2+ points, e.g. "what is machine learning")
        // keeps the bot's own longer answer, unless the person said "define".
        // A weak match keeps it too when the glossary word is only part of the
        // question: "what are the risks of AI?" is about risks, not about "AI".
        const define = defineRequest(norm);
        if (define) {
            if (!define.subject) return defineRandomAnswer();
            const strongMatch = best && best.score >= 2;
            if (define.explicit || !strongMatch) {
                const term = glossaryFind(define.subject);
                if (term && (define.explicit || !best || termCovers(term, define.subject))) {
                    return { reply: "glossary", data: term };
                }
                if (!best && define.subject.split(" ").length <= 3) {
                    return { reply: "notFound", data: { word: define.subject.slice(0, 40) } };
                }
            }
        }

        if (best) return commandOrOffer(answerFor(best.intent.id, tokens), tokens);

        // No keyword at all: maybe it's just a word from the glossary ("overfitting")
        const term = glossaryFind(text);
        if (term) return { reply: "glossary", data: term };

        return { reply: "fallback", data: { v: randomInt(2) } };
    }

    /* =========================================================
       5. BUILDING THE CHAT WINDOW
       ========================================================= */

    // Little SVG icons
    const ICONS = {
        close: '<svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/></svg>',
        reset: '<svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><path d="M4.5 12a7.5 7.5 0 1 0 2.2-5.3" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><path d="M4 4v4.5h4.5" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>',
        send: '<svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true"><path d="M4.5 12.5l14-7.5-4.5 15-3-6.2-6.5-1.3z" fill="currentColor"/></svg>',
        info: '<svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true"><circle cx="12" cy="12" r="9.2" fill="none" stroke="currentColor" stroke-width="1.8"/><path d="M12 10.8v6" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><circle cx="12" cy="7.6" r="1.2" fill="currentColor"/></svg>',
        chevron: '<svg viewBox="0 0 24 24" width="26" height="26" aria-hidden="true"><path d="M6 9.5l6 6 6-6" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/></svg>'
    };

    const CHIPS = [
        { intent: "ai", key: "assistant.chip.ai", icon: "🤖" },
        { intent: "recommend", key: "assistant.chip.lesson", icon: "📚" },
        { intent: "quiz", key: "assistant.chip.quiz", icon: "🏆" },
        { intent: "lab", key: "assistant.chip.lab", icon: "🧪" },
        { intent: "fact", key: "assistant.chip.fact", icon: "💡" },
        { intent: "define", key: "assistant.chip.define", icon: "📖" }
    ];

    // The orb (used by the launcher and, smaller, by the header)
    function orbHTML(extraClass) {
        return '<span class="cb-orb ' + (extraClass || "") + '" aria-hidden="true">' +
            '<span class="cb-orb-halo"></span>' +
            '<span class="cb-orb-ring"></span>' +
            '<span class="cb-orb-core"></span>' +
            '<span class="cb-orb-face"><span class="cb-eye"></span><span class="cb-eye"></span></span>' +
            "</span>";
    }

    mount.innerHTML =
        '<div class="cb-root">' +
            // "Ask me" hint next to the button (first visits only)
            '<div class="cb-tip" hidden>' +
                '<button type="button" class="cb-tip-text" data-i18n="assistant.tip">' + t("assistant.tip") + "</button>" +
                '<button type="button" class="cb-tip-close" data-i18n-attr="aria-label:assistant.tipClose,title:assistant.tipClose" ' +
                    'aria-label="' + esc(t("assistant.tipClose")) + '" title="' + esc(t("assistant.tipClose")) + '">' + ICONS.close + "</button>" +
            "</div>" +

            // The glowing round button
            '<button type="button" class="cb-launcher" aria-expanded="false" aria-controls="cb-panel" aria-haspopup="dialog" ' +
                'data-i18n-attr="aria-label:assistant.launcher,title:assistant.launcher" ' +
                'aria-label="' + esc(t("assistant.launcher")) + '" title="' + esc(t("assistant.launcher")) + '">' +
                orbHTML("cb-orb--launcher") +
                '<span class="cb-launcher-close" aria-hidden="true">' + ICONS.chevron + "</span>" +
                '<span class="cb-launcher-dot" aria-hidden="true"></span>' +
            "</button>" +

            // Dark layer behind the chat on phones
            '<div class="cb-backdrop" hidden></div>' +

            // The chat window
            '<section class="cb-panel" id="cb-panel" role="dialog" aria-labelledby="cb-title" aria-describedby="cb-disclaimer" hidden>' +
                '<span class="cb-grabber" aria-hidden="true"></span>' +
                '<header class="cb-head">' +
                    orbHTML("cb-orb--head") +
                    '<div class="cb-head-text">' +
                        '<h2 class="cb-title" id="cb-title" data-i18n="assistant.name">' + t("assistant.name") + "</h2>" +
                        '<p class="cb-status"><span class="cb-status-dot" aria-hidden="true"></span>' +
                            '<span class="cb-status-text" data-i18n="assistant.status">' + t("assistant.status") + "</span></p>" +
                    "</div>" +
                    '<div class="cb-head-actions">' +
                        '<button type="button" class="cb-icon-btn cb-reset" data-i18n-attr="aria-label:assistant.reset,title:assistant.reset" ' +
                            'aria-label="' + esc(t("assistant.reset")) + '" title="' + esc(t("assistant.reset")) + '">' + ICONS.reset + "</button>" +
                        '<button type="button" class="cb-icon-btn cb-close" data-i18n-attr="aria-label:assistant.close,title:assistant.close" ' +
                            'aria-label="' + esc(t("assistant.close")) + '" title="' + esc(t("assistant.close")) + '">' + ICONS.close + "</button>" +
                    "</div>" +
                "</header>" +

                '<p class="cb-disclaimer" id="cb-disclaimer">' +
                    '<span class="cb-disclaimer-icon" aria-hidden="true">' + ICONS.info + "</span>" +
                    '<span data-i18n="assistant.disclaimer">' + t("assistant.disclaimer") + "</span>" +
                "</p>" +

                '<div class="cb-log" role="log" aria-live="polite" aria-relevant="additions" tabindex="0" ' +
                    'data-i18n-attr="aria-label:assistant.logLabel" aria-label="' + esc(t("assistant.logLabel")) + '"></div>' +

                '<div class="cb-chips" role="group" data-i18n-attr="aria-label:assistant.chipsLabel" aria-label="' + esc(t("assistant.chipsLabel")) + '">' +
                    CHIPS.map(function (chip) {
                        return '<button type="button" class="cb-chip" data-intent="' + chip.intent + '">' +
                            '<span aria-hidden="true">' + chip.icon + "</span>" +
                            '<span data-i18n="' + chip.key + '">' + t(chip.key) + "</span></button>";
                    }).join("") +
                "</div>" +

                '<form class="cb-form" autocomplete="off">' +
                    '<label class="sr-only" for="cb-input" data-i18n="assistant.inputLabel">' + t("assistant.inputLabel") + "</label>" +
                    '<input class="cb-input" id="cb-input" type="text" maxlength="300" enterkeyhint="send" spellcheck="true" ' +
                        'data-i18n-attr="placeholder:assistant.placeholder" placeholder="' + esc(t("assistant.placeholder")) + '">' +
                    '<button type="submit" class="cb-send" disabled data-i18n-attr="aria-label:assistant.send,title:assistant.send" ' +
                        'aria-label="' + esc(t("assistant.send")) + '" title="' + esc(t("assistant.send")) + '">' + ICONS.send + "</button>" +
                "</form>" +
            "</section>" +
        "</div>";

    const ui = {
        root: mount.querySelector(".cb-root"),
        tip: mount.querySelector(".cb-tip"),
        tipText: mount.querySelector(".cb-tip-text"),
        tipClose: mount.querySelector(".cb-tip-close"),
        launcher: mount.querySelector(".cb-launcher"),
        backdrop: mount.querySelector(".cb-backdrop"),
        panel: mount.querySelector(".cb-panel"),
        statusText: mount.querySelector(".cb-status-text"),
        reset: mount.querySelector(".cb-reset"),
        close: mount.querySelector(".cb-close"),
        log: mount.querySelector(".cb-log"),
        chips: mount.querySelector(".cb-chips"),
        form: mount.querySelector(".cb-form"),
        input: mount.querySelector(".cb-input"),
        send: mount.querySelector(".cb-send")
    };

    /* =========================================================
       6. SHOWING MESSAGES
       ========================================================= */

    // The conversation for this tab: messages + "bags" for facts and jokes
    const chat = {
        messages: [],
        bags: {},
        last: {},
        hinted: false,
        nextId: 1
    };

    const state = {
        open: false,
        busy: false,
        queue: [],
        generation: 0,    // goes up on "new chat", so old replies are dropped
        lastFocus: null,
        hideTimer: 0,
        tipTimer: 0,
        lockedScroll: null,
        typingRow: null,
        prefill: ""       // the "Define " text the bot put in the message box
    };

    function fillBotRow(row, message) {
        const view = renderReply(message);
        row.querySelector(".cb-text").innerHTML = view.html;
        const box = row.querySelector(".cb-actions");
        box.innerHTML = "";
        box.hidden = !view.actions.length;
        view.actions.forEach(function (action) {
            const button = document.createElement("button");
            button.type = "button";
            button.className = "cb-action";
            button.setAttribute("data-act", action.act);
            button.setAttribute("data-arg", String(action.arg));
            button.innerHTML = '<span class="cb-action-icon" aria-hidden="true"></span><span class="cb-action-label"></span>';
            button.querySelector(".cb-action-icon").textContent = action.icon || "→";
            button.querySelector(".cb-action-label").textContent = action.label;
            box.appendChild(button);
        });
    }

    function buildRow(message, animate) {
        const row = document.createElement("div");
        row.className = "cb-msg cb-msg--" + (message.from === "user" ? "user" : "bot") + (animate ? " is-new" : "");
        row.setAttribute("data-id", String(message.id));

        const time = '<time class="cb-time" aria-hidden="true" datetime="' + new Date(message.time).toISOString() + '">' +
            clockTime(message.time) + "</time>";

        if (message.from === "user") {
            row.innerHTML =
                '<div class="cb-msg-body">' +
                    '<div class="cb-bubble"><span class="sr-only" data-i18n="assistant.youSaid">' + t("assistant.youSaid") + "</span> " +
                    '<span class="cb-user-text"></span></div>' + time +
                "</div>";
            // User text is always added as plain text, never as HTML
            row.querySelector(".cb-user-text").textContent = message.text;
        } else {
            row.innerHTML =
                '<span class="cb-avatar" aria-hidden="true"></span>' +
                '<div class="cb-msg-body">' +
                    '<div class="cb-bubble"><span class="sr-only" data-i18n="assistant.botSaid">' + t("assistant.botSaid") + "</span> " +
                    '<div class="cb-text"></div><div class="cb-actions"></div></div>' + time +
                "</div>";
            fillBotRow(row, message);
        }
        return row;
    }

    function scrollLogTo(top, smooth) {
        const log = ui.log;
        if (smooth && !noMotion() && typeof log.scrollTo === "function") {
            log.scrollTo({ top: top, behavior: "smooth" });
        } else {
            log.scrollTop = top;
        }
    }

    function scrollToEnd(smooth) {
        scrollLogTo(ui.log.scrollHeight, smooth);
    }

    // A new answer: show it from its start (with the question above it, if it fits).
    // Short answers simply scroll to the end; long ones are not cut off at the top.
    function scrollToAnswer(row, smooth) {
        const log = ui.log;
        const before = row.previousElementSibling;
        const anchor = before && before.classList.contains("cb-msg--user") ? before : row;
        const end = log.scrollHeight - log.clientHeight;
        // offsetTop is measured inside the log (it is position: relative in the CSS)
        const top = Math.max(0, Math.min(end, anchor.offsetTop - 12));
        scrollLogTo(top, smooth);
    }

    function addMessage(message, animate) {
        chat.messages.push(message);
        // Keep the chat short enough for the browser's storage
        while (chat.messages.length > MAX_MESSAGES) {
            chat.messages.shift();
            const first = ui.log.querySelector(".cb-msg");
            if (first) first.remove();
        }
        const row = buildRow(message, animate && !noMotion());
        if (state.typingRow && state.typingRow.parentNode === ui.log) {
            ui.log.insertBefore(row, state.typingRow);
        } else {
            ui.log.appendChild(row);
        }
        if (message.from === "bot") scrollToAnswer(row, animate);
        else scrollToEnd(animate);
        save();
        return row;
    }

    function addUserMessage(text) {
        return addMessage({ id: chat.nextId++, from: "user", text: String(text).slice(0, 300), time: Date.now() }, true);
    }

    function addBotMessage(reply, data, animate) {
        return addMessage({ id: chat.nextId++, from: "bot", reply: reply, data: data || {}, time: Date.now() }, animate);
    }

    function renderAll() {
        ui.log.innerHTML = "";
        chat.messages.forEach(function (message) {
            ui.log.appendChild(buildRow(message, false));
        });
        if (state.typingRow) ui.log.appendChild(state.typingRow);
        scrollToEnd(false);
    }

    // On language change: redraw the bot's answers in the new language,
    // quietly (so screen readers don't read the whole chat again)
    function retranslateMessages() {
        ui.log.setAttribute("aria-live", "off");
        ui.log.querySelectorAll(".cb-msg--bot").forEach(function (row) {
            const id = Number(row.getAttribute("data-id"));
            const message = chat.messages.find(function (item) { return item.id === id; });
            if (message) fillBotRow(row, message);
        });
        setTimeout(function () { ui.log.setAttribute("aria-live", "polite"); }, 300);
    }

    /* =========================================================
       7. TYPING DOTS AND THE REPLY QUEUE
       The bot "types" for a moment (longer answers take longer),
       then the answer appears. Several questions wait in a queue.
       ========================================================= */

    function setTyping(on) {
        ui.root.classList.toggle("is-typing", on);
        ui.statusText.textContent = t(on ? "assistant.statusTyping" : "assistant.status");
        ui.statusText.setAttribute("data-i18n", on ? "assistant.statusTyping" : "assistant.status");

        if (on && !state.typingRow) {
            const row = document.createElement("div");
            row.className = "cb-msg cb-msg--bot cb-typing";
            row.setAttribute("aria-hidden", "true");
            row.innerHTML = '<span class="cb-avatar"></span><div class="cb-msg-body"><div class="cb-bubble">' +
                '<span class="cb-dots"><span></span><span></span><span></span></span></div></div>';
            state.typingRow = row;
            ui.log.appendChild(row);
            scrollToEnd(true);
        } else if (!on && state.typingRow) {
            state.typingRow.remove();
            state.typingRow = null;
        }
    }

    // 500–900 ms, a bit longer for long answers
    function typingDelay(job) {
        const view = renderReply({ reply: job.reply, data: job.data || {} });
        const length = plainText(view.html).length;
        return Math.round(500 + Math.min(400, length * 1.1));
    }

    function enqueue(job) {
        job.generation = state.generation;
        state.queue.push(job);
        if (!state.busy) nextJob();
    }

    function nextJob() {
        const job = state.queue.shift();
        if (!job) {
            state.busy = false;
            setTyping(false);
            return;
        }
        state.busy = true;
        setTyping(true);
        setTimeout(function () {
            if (job.generation !== state.generation) return;   // the chat was restarted
            setTyping(false);
            deliver(job);
            setTimeout(function () {
                // A restarted chat has its own queue now: leave it alone
                if (job.generation === state.generation) nextJob();
            }, 150);
        }, typingDelay(job));
    }

    function deliver(job) {
        if (typeof job.pre === "function") safely(job.pre);
        addBotMessage(job.reply, job.data, true);

        // "Define a word": help the person by starting the sentence for them,
        // and put the cursor at its end so they can type the word right away
        if (job.fillInput && !ui.input.value) {
            ui.input.value = t("assistant.prefillDefine");
            state.prefill = ui.input.value;
            updateSendButton();
            if (state.open && ui.panel.contains(document.activeElement)) {
                ui.input.focus({ preventScroll: true });
                const end = ui.input.value.length;
                safely(function () { ui.input.setSelectionRange(end, end); });
            }
        }
        if (job.auto) {
            const action = job.auto;
            setTimeout(function () { runAction(action); }, 650);
        }
    }

    // Names that are written in Latin letters in Russian texts too
    const LATIN_NAMES = /^(eliza|chatgpt|gpt|alphago|alexa|siri|gemini|claude|copilot|google|openai|deepmind|midjourney|turing|python)$/i;

    // A message typed by the person
    function sendText(text) {
        const clean = String(text || "").trim().slice(0, 300);
        if (!clean) return;
        addUserMessage(clean);
        const job = think(clean);

        // Typed in the "other" alphabet? Offer the other language once
        // (not when the person is already talking about languages).
        if (job.reply === "langNow" || job.reply === "langSame" || job.reply === "langInfo") chat.hinted = true;
        // (never under a serious answer like "talk to a trusted adult")
        if (!chat.hinted && !job.calm) {
            const cyrillic = /[а-яё]/i.test(clean);
            // Names like "ELIZA", "ChatGPT" or "LLM" are written in Latin letters
            // in Russian too, so they don't count as English words
            const englishWords = (clean.match(/[a-z]{3,}/gi) || []).filter(function (word) {
                return word !== word.toUpperCase() && !LATIN_NAMES.test(word);
            });
            const latin = englishWords.length > 0 && !cyrillic;
            const hint = cyrillic && A.lang === "en" ? "ru" : (latin && A.lang === "ru" ? "en" : "");
            if (hint) {
                job.data = Object.assign({}, job.data, { hint: hint });
                chat.hinted = true;
            }
        }
        enqueue(job);
    }

    // A chip or "Another fact" button: shows its label as the person's message
    function sendIntent(intent, label) {
        addUserMessage(label);
        enqueue(answerFor(intent, []));
    }

    /* =========================================================
       8. BUTTONS INSIDE MESSAGES (ACTIONS)
       Everything that talks to other features is "defensive":
       if a feature is missing, we simply scroll to its section.
       ========================================================= */

    const LEAVING = ["lesson", "quiz", "lab", "glossary", "section"];

    // After "Go to: Glossary" the keyboard focus moves to that section's heading
    // (only if nothing else took it), so Tab continues from there
    function focusHeading(id) {
        const section = document.getElementById(id);
        const heading = section && section.querySelector("h1, h2");
        const active = document.activeElement;
        if (!heading || (active && active !== document.body && active !== ui.launcher)) return;
        if (!heading.hasAttribute("tabindex")) heading.setAttribute("tabindex", "-1");
        heading.focus({ preventScroll: true });
    }

    function runAction(action) {
        // The chat would cover the place we go to (on phones all of it, on computers
        // the right side), so it closes first. The conversation is kept, and the
        // round button opens it again.
        if (LEAVING.indexOf(action.act) !== -1 && state.open) closePanel(true);

        switch (action.act) {
            case "lesson": {
                const n = Number(action.arg) || 1;
                if (typeof A.openLesson === "function") safely(function () { A.openLesson(n); });
                else A.scrollToSection("lessons");
                break;
            }
            case "quiz":
                if (typeof A.startQuiz === "function") safely(function () { A.startQuiz(); });
                else A.scrollToSection("quiz");
                break;
            case "lab":
                if (typeof A.openLab === "function") safely(function () { A.openLab(action.arg === "predictor" ? "predictor" : "classifier"); });
                else A.scrollToSection("lab");
                break;
            case "glossary":
                // { focus: true }: the keyboard focus moves to the term card too
                if (A.glossary && typeof A.glossary.show === "function") safely(function () { A.glossary.show(action.arg, { focus: true }); });
                else A.scrollToSection("glossary");
                break;
            case "section": {
                const id = SECTIONS[action.arg] ? action.arg : "home";
                A.scrollToSection(id);
                focusHeading(id);
                break;
            }
            case "lang": {
                const target = action.arg === "ru" ? "ru" : "en";
                chat.hinted = true;
                if (target === A.lang) {
                    enqueue({ reply: "langSame", data: { l: target } });
                } else {
                    enqueue({ reply: "langNow", data: { l: target }, pre: function () { A.setLanguage(target); } });
                }
                break;
            }
            case "theme": {
                const theme = action.arg === "light" ? "light" : "dark";
                enqueue({
                    reply: theme === "dark" ? "themeDark" : "themeLight",
                    pre: function () { A.setTheme(theme); }
                });
                break;
            }
            case "ask": {
                // The person "says" the button's text, then the bot answers
                const labels = { fact: "assistant.act.fact", joke: "assistant.act.joke", define: "assistant.act.word" };
                sendIntent(action.arg, action.label || t(labels[action.arg] || "assistant.chip.fact"));
                break;
            }
        }
    }

    ui.log.addEventListener("click", function (event) {
        const button = event.target.closest(".cb-action");
        if (!button || !ui.log.contains(button)) return;
        const act = button.getAttribute("data-act");
        const arg = button.getAttribute("data-arg");
        const label = button.querySelector(".cb-action-label").textContent;
        runAction({ act: act, arg: act === "lesson" ? Number(arg) : arg, label: label });
    });

    ui.chips.addEventListener("click", function (event) {
        const chip = event.target.closest(".cb-chip");
        if (!chip) return;
        const info = CHIPS.find(function (item) { return item.intent === chip.getAttribute("data-intent"); });
        if (info) sendIntent(info.intent, t(info.key));
    });

    // On short screens the chips sit in one row that scrolls sideways.
    // A normal mouse wheel (up / down) scrolls that row too.
    ui.chips.addEventListener("wheel", function (event) {
        const chips = ui.chips;
        if (chips.scrollWidth <= chips.clientWidth + 1) return;            // everything fits
        if (Math.abs(event.deltaY) <= Math.abs(event.deltaX)) return;      // already sideways
        const step = event.deltaMode === 1 ? event.deltaY * 16 : event.deltaY;
        const before = chips.scrollLeft;
        chips.scrollLeft = before + step;
        if (chips.scrollLeft !== before) event.preventDefault();
    }, { passive: false });

    // ----- Typing and sending -----
    function updateSendButton() {
        ui.send.disabled = !ui.input.value.trim();
    }

    ui.input.addEventListener("input", updateSendButton);

    ui.form.addEventListener("submit", function (event) {
        event.preventDefault();
        const text = ui.input.value;
        if (!text.trim()) return;
        ui.input.value = "";
        updateSendButton();
        sendText(text);
        ui.input.focus({ preventScroll: true });
    });

    // Arrow Up in an empty box brings back your last message (like a terminal)
    ui.input.addEventListener("keydown", function (event) {
        if (event.key !== "ArrowUp" || ui.input.value) return;
        for (let i = chat.messages.length - 1; i >= 0; i--) {
            if (chat.messages[i].from === "user") {
                event.preventDefault();
                ui.input.value = chat.messages[i].text;
                updateSendButton();
                break;
            }
        }
    });

    ui.reset.addEventListener("click", function () {
        state.generation++;
        state.queue = [];
        state.busy = false;
        setTyping(false);
        chat.messages = [];
        chat.hinted = false;
        ui.log.innerHTML = "";
        addBotMessage("welcome", {}, true);
        ui.input.focus({ preventScroll: true });
    });

    /* =========================================================
       9. OPENING AND CLOSING THE CHAT
       Desktop: a window above the button (the page stays usable).
       Phones: an almost full-screen sheet that acts like a modal.
       ========================================================= */

    const sheetQuery = window.matchMedia("(max-width: 640px)");

    function isSheet() {
        return sheetQuery.matches;
    }

    function lockScroll(lock) {
        const body = document.body;
        if (lock && !state.lockedScroll) {
            state.lockedScroll = { overflow: body.style.overflow };
            body.style.overflow = "hidden";
        } else if (!lock && state.lockedScroll) {
            body.style.overflow = state.lockedScroll.overflow;
            state.lockedScroll = null;
        }
    }

    // Phones: keep the sheet exactly over the part of the screen you can see.
    // The visible part can be smaller than the page's "layout" area: when the
    // on-screen keyboard is open, or when something on the page is too wide.
    const SHEET_PROPS = ["--cb-sheet-h", "--cb-sheet-b", "--cb-sheet-l", "--cb-sheet-w"];

    function fitToViewport() {
        const viewport = window.visualViewport;
        const differs = viewport && (
            Math.abs(viewport.height - window.innerHeight) > 1 ||
            Math.abs(viewport.width - window.innerWidth) > 1 ||
            Math.abs(viewport.offsetLeft) > 1 || Math.abs(viewport.offsetTop) > 1
        );
        if (!state.open || !isSheet() || !differs) {
            // The normal CSS size is right
            SHEET_PROPS.forEach(function (name) { ui.panel.style.removeProperty(name); });
            return;
        }
        const below = Math.max(0, window.innerHeight - viewport.height - viewport.offsetTop);
        ui.panel.style.setProperty("--cb-sheet-h", Math.round(viewport.height - 16) + "px");
        ui.panel.style.setProperty("--cb-sheet-b", Math.round(below) + "px");
        ui.panel.style.setProperty("--cb-sheet-l", Math.round(viewport.offsetLeft) + "px");
        ui.panel.style.setProperty("--cb-sheet-w", Math.round(viewport.width) + "px");
    }

    function applyMode() {
        const sheet = isSheet();
        if (sheet) ui.panel.setAttribute("aria-modal", "true");
        else ui.panel.removeAttribute("aria-modal");
        ui.backdrop.hidden = !(state.open && sheet);
        lockScroll(state.open && sheet);
        fitToViewport();
    }

    function openPanel() {
        clearTimeout(state.hideTimer);
        if (state.open) {
            ui.input.focus({ preventScroll: true });
            return;
        }
        // Another window (the lesson reader) may cover the page and make the chat
        // unusable behind it: close that window first (if its feature allows it)
        if (ui.root.closest("[inert]") && typeof A.closeLesson === "function") safely(A.closeLesson);

        state.open = true;
        const active = document.activeElement;
        state.lastFocus = active && active !== document.body && !ui.panel.contains(active) ? active : null;

        dismissTip(true);
        if (!chat.messages.length) addBotMessage("welcome", {}, false);

        ui.panel.hidden = false;
        ui.root.classList.add("is-open");
        ui.launcher.setAttribute("aria-expanded", "true");
        applyMode();
        scrollToEnd(false);

        // Let the browser draw the hidden state first, then animate in
        void ui.panel.offsetWidth;
        ui.panel.classList.add("is-visible");
        ui.backdrop.classList.add("is-visible");
        ui.input.focus({ preventScroll: true });
    }

    function closePanel(restoreFocus) {
        if (!state.open) return;
        state.open = false;
        ui.panel.classList.remove("is-visible");
        ui.backdrop.classList.remove("is-visible");
        ui.root.classList.remove("is-open");
        ui.launcher.setAttribute("aria-expanded", "false");
        lockScroll(false);

        const wasInside = ui.panel.contains(document.activeElement);
        state.hideTimer = setTimeout(function () {
            if (state.open) return;
            ui.panel.hidden = true;
            ui.backdrop.hidden = true;
            fitToViewport();
        }, noMotion() ? 0 : 320);

        // Focus goes back to the round button
        if (restoreFocus !== false || wasInside) ui.launcher.focus({ preventScroll: true });
    }

    function togglePanel() {
        if (state.open) closePanel(true);
        else openPanel();
    }

    ui.launcher.addEventListener("click", togglePanel);
    ui.close.addEventListener("click", function () { closePanel(true); });
    ui.backdrop.addEventListener("click", function () { closePanel(true); });

    // Esc closes (from the chat or the round button); on phones Tab stays inside the sheet
    ui.root.addEventListener("keydown", function (event) {
        if (!state.open) return;
        if (event.key === "Escape") {
            event.preventDefault();
            event.stopPropagation();
            closePanel(true);
            return;
        }
        if (event.key === "Tab" && isSheet()) trapFocus(event);
    });

    function trapFocus(event) {
        const items = Array.prototype.slice.call(ui.panel.querySelectorAll(
            'button:not([disabled]), input, [href], [tabindex]:not([tabindex="-1"])'
        )).filter(function (element) { return element.getClientRects().length > 0; });
        if (!items.length) return;
        const first = items[0];
        const last = items[items.length - 1];
        if (event.shiftKey && document.activeElement === first) {
            event.preventDefault();
            last.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
            event.preventDefault();
            first.focus();
        }
    }

    if (sheetQuery.addEventListener) sheetQuery.addEventListener("change", applyMode);
    else if (sheetQuery.addListener) sheetQuery.addListener(applyMode);

    if (window.visualViewport) {
        window.visualViewport.addEventListener("resize", fitToViewport);
        window.visualViewport.addEventListener("scroll", fitToViewport);
    }
    window.addEventListener("resize", fitToViewport, { passive: true });

    // ----- Phones: pull the sheet down by its top edge to close it -----
    const drag = { id: null, startY: 0, lastY: 0, lastTime: 0, speed: 0, distance: 0 };

    ui.panel.addEventListener("pointerdown", function (event) {
        if (!state.open || !isSheet() || drag.id !== null || event.button > 0) return;
        // Only the handle and the header (but not its buttons) start a drag
        if (!event.target.closest(".cb-grabber, .cb-head") || event.target.closest("button")) return;
        drag.id = event.pointerId;
        drag.startY = drag.lastY = event.clientY;
        drag.lastTime = event.timeStamp;
        drag.speed = 0;
        drag.distance = 0;
        ui.panel.classList.add("is-dragging");
        safely(function () { ui.panel.setPointerCapture(event.pointerId); });
    });

    ui.panel.addEventListener("pointermove", function (event) {
        if (event.pointerId !== drag.id) return;
        const time = Math.max(1, event.timeStamp - drag.lastTime);
        drag.speed = (event.clientY - drag.lastY) / time;            // pixels per millisecond
        drag.lastY = event.clientY;
        drag.lastTime = event.timeStamp;
        drag.distance = Math.max(0, event.clientY - drag.startY);  // only downwards
        ui.panel.style.transform = "translateY(" + drag.distance + "px)";
    });

    function endDrag(event) {
        if (event.pointerId !== drag.id) return;
        drag.id = null;
        ui.panel.classList.remove("is-dragging");
        ui.panel.style.transform = "";
        // Far enough, or a quick flick down: close. Otherwise it slides back.
        const flick = drag.distance > 24 && drag.speed > 0.5;
        if (event.type === "pointerup" && (drag.distance > 90 || flick)) closePanel(true);
    }

    ui.panel.addEventListener("pointerup", endDrag);
    ui.panel.addEventListener("pointercancel", endDrag);

    /* =========================================================
       10. SAVING THE CHAT FOR THIS TAB (sessionStorage)
       It survives a page reload, but is forgotten when the tab closes.
       ========================================================= */

    function save() {
        try {
            sessionStorage.setItem(SESSION_KEY, JSON.stringify({
                v: 1,
                messages: chat.messages,
                bags: chat.bags,
                last: chat.last,
                hinted: chat.hinted
            }));
        } catch (error) {}
    }

    function load() {
        let saved = null;
        try {
            saved = JSON.parse(sessionStorage.getItem(SESSION_KEY));
        } catch (error) {
            saved = null;
        }
        if (!saved || saved.v !== 1 || !Array.isArray(saved.messages)) return;

        chat.messages = saved.messages.filter(function (message) {
            return message && typeof message.id === "number" && typeof message.time === "number" &&
                (message.from === "user" ? typeof message.text === "string" : typeof message.reply === "string");
        }).slice(-MAX_MESSAGES);
        chat.bags = saved.bags && typeof saved.bags === "object" ? saved.bags : {};
        chat.last = saved.last && typeof saved.last === "object" ? saved.last : {};
        chat.hinted = Boolean(saved.hinted);
        chat.nextId = chat.messages.reduce(function (max, message) { return Math.max(max, message.id); }, 0) + 1;
    }

    /* =========================================================
       11. LITTLE EXTRAS
       ========================================================= */

    // ----- The "Ask me" hint -----
    // Shown on the first few visits (until it is closed or the chat is opened).
    // It hides by itself after a few seconds, and while the footer is on
    // screen, so it never sits on top of the page's links for long.
    const TIP_VISITS = 3;
    const TIP_SECONDS = 10;
    let footerVisible = false;

    function showTipLater() {
        if (A.storage.get("assistant.tipDismissed", false)) return;
        const visits = Number(A.storage.get("assistant.tipVisits", 0)) || 0;
        if (visits >= TIP_VISITS) return;
        state.tipTimer = setTimeout(function () {
            if (state.open || footerVisible) return;
            A.storage.set("assistant.tipVisits", visits + 1);
            ui.tip.hidden = false;
            ui.root.classList.add("has-tip");
            void ui.tip.offsetWidth;
            ui.tip.classList.add("is-visible");
            // Hide again later, without remembering it (it may come back next visit)
            state.tipTimer = setTimeout(function () { dismissTip(false); }, TIP_SECONDS * 1000);
        }, 2200);
    }

    const footer = document.querySelector(".footer, footer");
    if (footer && "IntersectionObserver" in window) {
        new IntersectionObserver(function (entries) {
            footerVisible = entries[0].isIntersecting;
            if (footerVisible && !ui.tip.hidden) dismissTip(false);
        }).observe(footer);
    }

    function dismissTip(remember) {
        clearTimeout(state.tipTimer);
        if (remember) A.storage.set("assistant.tipDismissed", true);
        ui.root.classList.remove("has-tip");
        if (ui.tip.hidden) return;
        const tipHadFocus = ui.tip.contains(document.activeElement);
        ui.tip.classList.remove("is-visible");
        ui.tip.hidden = true;
        if (tipHadFocus && !state.open) ui.launcher.focus({ preventScroll: true });
    }

    ui.tipText.addEventListener("click", openPanel);
    ui.tipClose.addEventListener("click", function () { dismissTip(true); });

    // ----- The orb's eyes follow the mouse (only with a mouse, and with motion on) -----
    const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)");
    const look = { x: 0, y: 0, frame: 0, center: null };

    // The button's centre is measured once and again only after a resize
    window.addEventListener("resize", function () { look.center = null; }, { passive: true });

    function updateLook() {
        look.frame = 0;
        if (!look.center) {
            const rect = ui.launcher.getBoundingClientRect();
            look.center = { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 };
        }
        const dx = look.x - look.center.x;
        const dy = look.y - look.center.y;
        const distance = Math.hypot(dx, dy) || 1;
        const reach = Math.min(1, distance / 260) * 3.2;
        ui.launcher.style.setProperty("--look-x", (dx / distance * reach).toFixed(2) + "px");
        ui.launcher.style.setProperty("--look-y", (dy / distance * reach).toFixed(2) + "px");
    }

    document.addEventListener("pointermove", function (event) {
        if (state.open || !finePointer.matches || noMotion() || document.hidden) return;
        look.x = event.clientX;
        look.y = event.clientY;
        if (!look.frame) look.frame = requestAnimationFrame(updateLook);
    }, { passive: true });

    /* =========================================================
       12. LANGUAGE, CTRL+K COMMANDS, PUBLIC API AND START-UP
       ========================================================= */

    // The window's labels are translated by core (data-i18n).
    // Here we redraw the answers and the typing status.
    A.onLanguageChange(function () {
        retranslateMessages();
        ui.statusText.textContent = t(state.busy ? "assistant.statusTyping" : "assistant.status");
        // "Define " the bot typed for you (and you didn't change) -> "Что такое "
        if (state.prefill && ui.input.value === state.prefill) {
            ui.input.value = t("assistant.prefillDefine");
            state.prefill = ui.input.value;
        }
    });

    A.registerCommand({
        id: "assistant-open",
        group: "assistant.cmdGroup",
        icon: "🤖",
        title: function () { return t("assistant.cmdOpen"); },
        keywords: "assistant chat bot compass help ask question talk помощник чат бот помощь спросить вопрос поговорить",
        run: function () { openPanel(); }
    });

    A.registerCommand({
        id: "assistant-fact",
        group: "assistant.cmdGroup",
        icon: "💡",
        title: function () { return t("assistant.cmdFact"); },
        keywords: "fun fact did you know trivia interesting интересный факт знаешь ли ты",
        run: function () {
            openPanel();
            sendIntent("fact", t("assistant.chip.fact"));
        }
    });

    A.registerCommand({
        id: "assistant-joke",
        group: "assistant.cmdGroup",
        icon: "😄",
        title: function () { return t("assistant.cmdJoke"); },
        keywords: "joke funny laugh humor шутка анекдот смешно юмор",
        run: function () {
            openPanel();
            sendIntent("joke", t("assistant.chip.joke"));
        }
    });

    // Other features (like the Ctrl+K palette) can talk to Compass Bot
    A.assistant = {
        open: openPanel,
        close: function () { closePanel(true); },
        toggle: togglePanel,
        ask: function (text) {
            openPanel();
            sendText(text);
        },
        get isOpen() { return state.open; }
    };

    // Start
    load();
    if (chat.messages.length) renderAll();
    updateSendButton();
    showTipLater();
})();
