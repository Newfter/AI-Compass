/* =========================================================
   AI COMPASS — TEXTS: COMPASS BOT (THE ASSISTANT)
   Every word in English and in Russian (informal "ты").
   Used by js/assistant.js.
   To change a text, change it here (in both languages).
   Below the texts: the bot's "brain" (its word lists and answers).
   ========================================================= */

window.AICompass.addTranslations({
    en: {
        // ----- The chat window -----
        "assistant.name": "Compass Bot",
        "assistant.launcher": "Chat with Compass Bot",
        "assistant.tip": "Ask me about AI!",
        "assistant.tipClose": "Hide this hint",
        "assistant.status": "Online · scripted demo",
        "assistant.statusTyping": "Typing…",
        "assistant.disclaimer": "<strong>Honest note:</strong> I'm a scripted demo bot, not a real AI. Like ELIZA (1966), I match keywords — and I look things up in this site's lessons, glossary and timeline.",
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
        "assistant.chip.quizMe": "Quiz me",
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
        "assistant.r.who": "I'm <strong>Compass Bot</strong>, the helper of this website. Honest confession: <strong>I'm not a real AI.</strong> I look for keywords in your message and pick a prepared answer — just like <strong>ELIZA</strong>, one of the very first chatbots (1966). When I have no prepared answer, I look things up in this site's lessons, glossary and timeline.<br><br>Modern AI chatbots like ChatGPT work very differently: they learned the patterns of language from huge amounts of text.",
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
        "assistant.r.recNext": "You've already finished {count} {lessons} out of {total} — nice work! 💪 Next up: <strong>{lesson}</strong>",
        "assistant.r.recAll": "Wow, all {total} {lessons} are done! 🏆 Time to test yourself in the quiz — or replay any lesson you like.",
        "assistant.r.games": "Yes — at some games AI beats the best humans! ♟️ In 1997 IBM's <strong>Deep Blue</strong> beat world chess champion Garry Kasparov, and in 2016 DeepMind's <strong>AlphaGo</strong> beat Lee Sedol at Go, 4 games to 1. Today the strongest chess programs play far better than any human.<br><br>But a chess program is only good at chess: being great at one game doesn't make an AI smart in general.",
        "assistant.r.conscious": "Does AI think or feel? <strong>No</strong> — as far as scientists can tell, today's AI has no feelings, consciousness or wishes. A chatbot can write “I'm happy”, but only because those words fit the patterns it learned. It's very good at <em>imitating</em> human language — that's not the same as being human 🙂",
        "assistant.r.sad": "I'm sorry you're feeling this way 💜 I'm only a simple script, so I can't really help with feelings — but talking to someone you trust, like a friend, a family member or a teacher, really can. You don't have to deal with it alone.",
        "assistant.r.support": "I'm really sorry you're going through this. I'm only a simple script, so I can't help with this properly — but <strong>you don't have to deal with it alone</strong>.<br><br>Please talk to a <strong>trusted adult right now</strong>: a parent, a teacher or your school counsellor.<br><br>If you are in danger, call your local emergency number: <strong>112</strong> in Europe and Russia, <strong>911</strong> in the US. You can also call a free helpline: <strong>116 111</strong> (for children and young people in many European countries) or <strong>988</strong> in the US.",
        "assistant.r.about": "<strong>AI Compass</strong> was made by students as a <strong>CAS project</strong> 🎓 — a free, bilingual guide that helps anyone understand how AI works, use it wisely and think about it critically. No sign-up, no ads.",
        "assistant.r.ack": "😊 Glad I could help! What next — a <strong>fun fact</strong>, a <strong>lesson</strong> or the <strong>quiz</strong>?",
        "assistant.r.lessonOpen": "Opening <strong>{lesson}</strong> 📖",
        "assistant.r.lessonMissing": "There are only {total} {lessons} on this site — try a number from 1 to {total} 🙂",
        "assistant.r.lessonOffer": "Here's <strong>{lesson}</strong> 📖 Open it whenever you like:",
        "assistant.r.quiz": "Let's go! 🏆 Taking you to the AI Challenge — good luck!",
        "assistant.r.quizOffer": "Want to test yourself? 🏆 The <strong>AI Challenge</strong> is a short quiz about everything on this site. Start it whenever you're ready:",
        "assistant.r.lab": "Opening the AI Lab 🧪 There you can <strong>teach a real neural network</strong> or play with a <strong>next-word predictor</strong> — a tiny language model. Switch between them with the buttons below.",
        "assistant.r.labOffer": "The <strong>AI Lab</strong> is full of experiments 🧪 Two good ones to start with: <strong>teach a real neural network</strong>, or play with a <strong>next-word predictor</strong> — a tiny language model. Pick one:",
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
        "assistant.r.help": "Here's what I can do 🧭<br>• explain <strong>AI</strong>, <strong>machine learning</strong>, <strong>neural networks</strong> and <strong>chatbots</strong><br>• talk about <strong>hallucinations</strong>, <strong>bias</strong>, <strong>privacy</strong> and <strong>AI safety</strong><br>• give tips on using AI for <strong>homework</strong> honestly<br>• <strong>recommend a lesson</strong>, start the <strong>quiz</strong> or open the <strong>AI Lab</strong><br>• explain words: <em>“define algorithm”</em><br>• look things up in this site's <strong>lessons</strong>, <strong>glossary</strong> and <strong>timeline</strong> — then say <em>“tell me more”</em>, <em>“example?”</em> or <em>“in simple words”</em><br>• <strong>quiz you</strong>: <em>“quiz me on neural networks”</em><br>• tell a <strong>fun fact</strong> or a <strong>joke</strong><br>• switch the <strong>theme</strong> or <strong>language</strong>, or take you to any section",
        "assistant.r.fallback1": "Hmm, I didn't get that 🤔 Remember, I'm a simple script: I only understand certain keywords.",
        "assistant.r.fallback2": "Sorry, that's not in my script 😅 I'm not a real AI — I just look for keywords.",
        "assistant.r.tryList": "Try: <em>“what is machine learning?”</em>, <em>“are chatbots always right?”</em>, <em>“recommend a lesson”</em>, <em>“tell me a joke”</em> — or <em>“help”</em> to see everything I can do.",
        "assistant.r.hint.ru": "By the way, the whole site is also available in Russian.",
        "assistant.r.hint.en": "By the way, the whole site is also available in English.",

        // ----- Fun facts (all checked) -----
        // To add one, write "assistant.fact14" here AND in the Russian part:
        // the bot counts the facts by itself
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
        // To add one, write "assistant.joke6" here AND in the Russian part
        "assistant.joke1": "What kind of music do robots like? <strong>Heavy metal!</strong> 🤘",
        "assistant.joke2": "Why did the AI cross the road? Because its training data said that's what chickens do 🐔",
        "assistant.joke3": "I asked a machine-learning model to tell me a joke. It said: “Sorry, I'm still in training.” 🏋️",
        "assistant.joke4": "Why do robots never panic? They have <strong>nerves of steel</strong> 🦾",
        "assistant.joke5": "A neural network walks into a café. The barista asks: “What would you like?” It answers: “Whatever most people in my training data ordered.” ☕",

        // ----- Answers from the site (lessons, glossary, timeline) -----
        "assistant.sources": "Sources",
        "assistant.seeAlso": "On the site",
        "assistant.act.more": "Read more",
        "assistant.r.site": "{icon} <strong>{title}</strong><br>{text}",
        "assistant.r.siteEnd": "That's everything “{title}” says 🙂 Open it to read it in its place:",
        "assistant.r.siteGone": "Hmm, I can't find that text on the site any more 🤔",
        "assistant.r.unsure": "I'm not sure I found the right answer 🤔 Try asking in other words — or look at one of these parts of the site:",
        "assistant.r.example": "💡 <strong>An example</strong> · {term}<br>{example}",
        "assistant.r.simple": "🧩 <strong>{term}</strong>, in simple words: {text}",
        "assistant.r.noTopic": "More about what? 🙂 Ask me something first — for example <em>“what is a neural network?”</em>",
        "assistant.r.noExample": "I don't have an example for that 😅 Ask me about a word, like <em>“what is a token?”</em>, then say <em>“example?”</em>",
        "assistant.r.noSimple": "I can't put that more simply, sorry 😅 Ask me about a word, like <em>“what is a token?”</em>, then say <em>“in simple words”</em>",

        // ----- "Did this help?" under answers from the site -----
        "assistant.helpful": "Did this help?",
        "assistant.helpfulYes": "Yes, it helped",
        "assistant.helpfulNo": "No, it didn't help",
        "assistant.helpfulNote": "Thanks! Counted only in this browser — nothing is sent anywhere.",

        // ----- "Quiz me": a question from the quiz, inside the chat -----
        "assistant.optionsLabel": "Answer options",
        "assistant.optionRight": "(the right answer)",
        "assistant.optionChosen": "(your answer)",
        "assistant.act.another": "Another question",
        "assistant.r.quizAsk": "🎯 <strong>Quiz question</strong> · {topic}<br>{question}",
        "assistant.r.quizTrueFalse": "True or false: {statement}",
        "assistant.r.quizMiss": "I have no question about <strong>“{topic}”</strong>, so here's another one.",
        "assistant.r.quizRight": "✅ <strong>Right!</strong> {explain}",
        "assistant.r.quizWrong": "❌ <strong>Not quite.</strong> The right answer: <strong>{answer}</strong>. {explain}",
        "assistant.r.noQuiz": "The quiz questions aren't available right now 😕",

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
        "assistant.disclaimer": "<strong>Честно:</strong> я демо-бот по сценарию, а не настоящий ИИ. Как и ELIZA (1966), я ищу ключевые слова — а ещё смотрю ответы в уроках, словаре и хронологии этого сайта.",
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
        "assistant.chip.quizMe": "Проверь меня",
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
        "assistant.r.who": "Я <strong>Compass Bot</strong>, помощник этого сайта. Честное признание: <strong>я не настоящий ИИ.</strong> Я ищу ключевые слова в твоём сообщении и выбираю заготовленный ответ — как <strong>ELIZA</strong>, один из самых первых чат-ботов (1966). А если заготовленного ответа нет, я ищу его в уроках, словаре и хронологии этого сайта.<br><br>Современные чат-боты вроде ChatGPT устроены совсем иначе: они выучили закономерности языка на огромном количестве текстов.",
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
        "assistant.r.recNext": "Позади уже {count} {lessons} из {total} — отличная работа! 💪 Следующий шаг — <strong>{lesson}</strong>.",
        "assistant.r.recAll": "Ого, все {total} {lessons} пройдены! 🏆 Пора проверить себя в тесте — или повтори любой урок.",
        "assistant.r.games": "Да — в некоторых играх ИИ обыгрывает лучших людей! ♟️ В 1997 году компьютер IBM <strong>Deep Blue</strong> победил чемпиона мира по шахматам Гарри Каспарова, а в 2016 году программа <strong>AlphaGo</strong> от DeepMind обыграла Ли Седоля в го со счётом 4:1. Сегодня сильнейшие шахматные программы играют намного лучше любого человека.<br><br>Но шахматная программа умеет только играть в шахматы: если ИИ силён в одной игре, это ещё не значит, что он умён во всём.",
        "assistant.r.conscious": "Может ли ИИ думать или чувствовать? <strong>Нет</strong> — насколько известно учёным, у современного ИИ нет чувств, сознания и желаний. Чат-бот может написать «я рад», но только потому, что эти слова подходят под выученные закономерности. Он отлично <em>подражает</em> человеческому языку — но это не то же самое, что быть человеком 🙂",
        "assistant.r.sad": "Мне жаль, что тебе сейчас так 💜 Я всего лишь простой скрипт и не умею помогать с чувствами — но разговор с тем, кому ты доверяешь, — с другом, родными или учителем — правда помогает. С этим не нужно справляться в одиночку.",
        "assistant.r.support": "Мне очень жаль, что тебе сейчас так тяжело. Я всего лишь простой скрипт и не могу как следует помочь — но <strong>с этим не нужно справляться в одиночку</strong>.<br><br>Пожалуйста, <strong>прямо сейчас поговори со взрослым, которому доверяешь</strong>: с мамой или папой, учителем или школьным психологом.<br><br>Если тебе угрожает опасность, звони в экстренную службу — <strong>112</strong>. А ещё можно бесплатно и анонимно позвонить на детский телефон доверия: в России это <strong>8-800-2000-122</strong>. Если ты живёшь в другой стране, позвони в местную экстренную службу или на телефон доверия своей страны.",
        "assistant.r.about": "<strong>AI Compass</strong> создали школьники в рамках <strong>проекта CAS</strong> 🎓 — это бесплатный двуязычный путеводитель, который помогает понять, как работает ИИ, пользоваться им с умом и оценивать его критически. Без регистрации и рекламы.",
        "assistant.r.ack": "😊 Рад помочь! Что дальше — <strong>интересный факт</strong>, <strong>урок</strong> или <strong>тест</strong>?",
        "assistant.r.lessonOpen": "Открываю <strong>{lesson}</strong> 📖",
        "assistant.r.lessonMissing": "На сайте всего {total} {lessons} — попробуй номер от 1 до {total} 🙂",
        "assistant.r.lessonOffer": "Вот <strong>{lesson}</strong> 📖 Открывай, когда захочешь:",
        "assistant.r.quiz": "Поехали! 🏆 Переношу тебя к ИИ-испытанию — удачи!",
        "assistant.r.quizOffer": "Хочешь проверить себя? 🏆 <strong>ИИ-испытание</strong> — короткий тест обо всём, что есть на этом сайте. Начинай, как только захочешь:",
        "assistant.r.lab": "Открываю ИИ-лабораторию 🧪 Там можно <strong>обучить настоящую нейросеть</strong> или поиграть с <strong>предсказателем слов</strong> — крошечной языковой моделью. Переключайся между ними кнопками ниже.",
        "assistant.r.labOffer": "В <strong>ИИ-лаборатории</strong> много экспериментов 🧪 Для начала подойдут два: <strong>обучить настоящую нейросеть</strong> или поиграть с <strong>предсказателем слов</strong> — крошечной языковой моделью. Выбирай:",
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
        "assistant.r.help": "Вот что я умею 🧭<br>• объяснить, что такое <strong>ИИ</strong>, <strong>машинное обучение</strong>, <strong>нейросети</strong> и <strong>чат-боты</strong><br>• рассказать о <strong>галлюцинациях</strong>, <strong>предвзятости</strong>, <strong>приватности</strong> и <strong>безопасности ИИ</strong><br>• подсказать, как честно использовать ИИ для <strong>домашки</strong><br>• <strong>посоветовать урок</strong>, начать <strong>тест</strong> или открыть <strong>ИИ-лабораторию</strong><br>• объяснить слово: <em>«что такое алгоритм»</em><br>• найти ответ в <strong>уроках</strong>, <strong>словаре</strong> и <strong>хронологии</strong> сайта — а потом напиши <em>«расскажи подробнее»</em>, <em>«пример?»</em> или <em>«проще»</em><br>• <strong>проверить тебя</strong>: <em>«проверь меня по нейросетям»</em><br>• рассказать <strong>интересный факт</strong> или <strong>шутку</strong><br>• сменить <strong>тему</strong> или <strong>язык</strong> и перенести тебя в любой раздел сайта",
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

        "assistant.sources": "Источники",
        "assistant.seeAlso": "На сайте",
        "assistant.act.more": "Читать дальше",
        "assistant.r.site": "{icon} <strong>{title}</strong><br>{text}",
        "assistant.r.siteEnd": "Это всё, что написано в «{title}» 🙂 Открой, чтобы прочитать на месте:",
        "assistant.r.siteGone": "Хм, я больше не нахожу этот текст на сайте 🤔",
        "assistant.r.unsure": "Не уверен, что нашёл правильный ответ 🤔 Попробуй спросить другими словами — или загляни в одну из этих частей сайта:",
        "assistant.r.example": "💡 <strong>Пример</strong> · {term}<br>{example}",
        "assistant.r.simple": "🧩 <strong>{term}</strong>, если проще: {text}",
        "assistant.r.noTopic": "Подробнее о чём? 🙂 Сначала спроси меня о чём-нибудь — например, <em>«что такое нейросеть?»</em>",
        "assistant.r.noExample": "У меня нет примера для этого 😅 Спроси о слове, например <em>«что такое токен?»</em>, а потом напиши <em>«пример?»</em>",
        "assistant.r.noSimple": "Проще объяснить не получится, извини 😅 Спроси о слове, например <em>«что такое токен?»</em>, а потом напиши <em>«проще»</em>",

        "assistant.helpful": "Это помогло?",
        "assistant.helpfulYes": "Да, помогло",
        "assistant.helpfulNo": "Нет, не помогло",
        "assistant.helpfulNote": "Спасибо! Я считаю это только в твоём браузере — никуда ничего не отправляется.",

        "assistant.optionsLabel": "Варианты ответа",
        "assistant.optionRight": "(правильный ответ)",
        "assistant.optionChosen": "(твой ответ)",
        "assistant.act.another": "Ещё вопрос",
        "assistant.r.quizAsk": "🎯 <strong>Вопрос из теста</strong> · {topic}<br>{question}",
        "assistant.r.quizTrueFalse": "Верно или нет: {statement}",
        "assistant.r.quizMiss": "У меня нет вопроса про <strong>«{topic}»</strong>, так что вот другой.",
        "assistant.r.quizRight": "✅ <strong>Правильно!</strong> {explain}",
        "assistant.r.quizWrong": "❌ <strong>Не совсем.</strong> Правильный ответ: <strong>{answer}</strong>. {explain}",
        "assistant.r.noQuiz": "Вопросы теста сейчас недоступны 😕",

        "assistant.cmdGroup": "Compass Bot",
        "assistant.cmdOpen": "Поговорить с Compass Bot",
        "assistant.cmdFact": "Compass Bot: расскажи интересный факт",
        "assistant.cmdJoke": "Compass Bot: расскажи шутку"
    }
});

/* =========================================================
   COMPASS BOT'S "BRAIN"
   The bot is not a real AI: it looks for these words in a message
   and picks a prepared answer (see section 4 of js/assistant.js).
   The words are written in lower case, "ё" as "е", and without
   punctuation ("what's up" is written "what s up").

   1. Intents: what the person wants, and the words that show it
   2. Going to a section of the site
   3. Doing something ("start the quiz") or only offering a button
   4. Messages that need a real person, not a script
   5. "What is X?" questions
   6. Words for the theme, the language and the lab
   7. Simple answers and their buttons
   8. The quick-question chips under the chat
   9. Answers from the site: sources, search hints, follow-ups, "quiz me"

   To add a fun fact or a joke, add "assistant.fact14" (or
   "assistant.joke6") above, in BOTH languages: the bot counts them.
   ========================================================= */

window.AICompass.content.set("assistant", {
    /* ----- 1. Intents -----
       An "intent" is what the person wants (a greeting, a quiz...).
       Each intent has keywords in BOTH languages.
       - "word*"  matches the start of a word: "нейросет*" finds "нейросети"
       - "?word"  is a weak hint and counts only half a point
       - phrases with several words score more ("machine learning" = 2)
       The intent with the most points wins. On a tie, the one
       higher in this list wins.
       Long keywords (7+ letters) may have one typo in the message
       ("lerning"), shorter ones must be exact. Real words that only look
       like a typo go into notTypos (below the list).
       strict: true = no typos at all for this intent. */
    intents: [
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
            // ("quiz me" / "проверь меня" ask one question in the chat: see quizMe in section 9)
            words: ["quiz*", "start quiz", "start the quiz", "begin the quiz", "take the quiz", "take a quiz",
                "test myself", "take the test", "take a test", "start the test", "ai challenge",
                "тест", "тестик", "викторин*", "начать тест", "начни тест", "запусти тест", "пройти тест",
                "проверить себя", "проверь себя", "испытани*"]
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
            // ("recommend", not "recommend*": "recommendation systems" are a topic of lesson 5)
            words: ["recommend", "suggest*", "which lesson", "what lesson", "next lesson", "where to start",
                "where do i start", "where should i start", "what should i learn", "what to learn", "?lesson",
                "how do i start", "how to start", "how should i start", "where do i begin", "start learning",
                "beginner*", "getting started", "новичок*", "как начать", "с чего начинать", "хочу научиться",
                "посоветуй*", "порекомендуй*", "рекомендуй*", "рекомендуешь", "какой урок", "с чего начать", "что изучить",
                "что изучать", "следующ* урок*", "?урок"]
        },
        {
            // (the Turing test has its own glossary term and milestone: answered from the site)
            id: "eliza",
            words: ["eliza", "first chatbot*", "first chat bot*", "weizenbaum",
                "элиза", "элайза", "перв* чат бот*", "перв* чатбот*", "вейценбаум*"]
        },
        {
            id: "history",
            words: ["who invented ai", "who invented artificial intelligence", "who created ai", "inventor*",
                "father of ai", "birth of ai", "when was ai invented", "when did ai start", "history of ai",
                "history of artificial intelligence", "ai history", "кто придумал ии", "истори* ии",
                "истори* искусственн*",
                "кто изобрел* ии", "кто изобрел* искусственн*", "кто создал ии", "изобретател*", "отец ии",
                "когда появился ии", "когда придумали ии"]
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
                "живой", "живая", "сознани*", "чувствует", "чувствуешь", "чувствовать", "чувства", "эмоци*",
                "может ли ии думать", "может ли ии чувствовать", "думает ли", "разумн*"]
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
                "чат бот* выдумыва*", "чат бот* врут", "чат бот* ошиба*",
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
                "deep fake*", "good or bad", "bad or good", "хорошо или плохо", "плохо или хорошо",
                "опас*", "захват*", "восстание машин", "восстан*", "терминатор*", "скайнет",
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
            // (generative AI in general is answered from the site: its glossary term and lesson 4)
            words: ["chatbot*", "chat bot*", "chatgpt", "chat gpt", "gpt*", "llm*", "large language model*",
                "language model*", "claude", "gemini", "copilot", "how does chatgpt work", "чат бот*", "чатбот*",
                "чатгпт", "чат гпт", "гпт", "языков* модел*", "больш* языков* модел*"]
        },
        {
            id: "nn",
            // (deep learning has its own glossary term: answered from the site)
            words: ["neural network*", "neural net*", "neural", "neuron*", "layers", "weights",
                "нейросет*", "нейронн* сет*", "нейрон*", "нейронк*", "слои", "веса"]
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
            // Scored by navScore() in js/assistant.js, with the
            // section words and the "go to" words below
            id: "nav", strict: true
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
            // "help" is weak: "how can AI help doctors?" is about AI, not about the bot,
            // and "I need help with my homework" is about homework
            words: ["?help", "?help me", "?i need help", "what can you do", "what do you do", "what can i ask", "commands",
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
    ],

    // Real words that are one letter away from a keyword but mean something
    // else: the bot never reads them as a typo. "neural" is not "neutral",
    // "feeling" is not "feelings", "sentiment" is not "sentient",
    // "писать" (to write) is not "списать" (to copy).
    notTypos: ["neural", "feeling", "sentiment", "писать"],

    // Small talk at the start of a message. "Hi! How does AI work?" is a
    // question, not only a greeting: when one of these intents wins and the
    // message STARTS with it, the bot answers the 2+ words after it instead
    // (if it understands them). And a thank-you FOR something is a thank-you:
    // "thanks for the joke", "спасибо большое за помощь" (thanksFor).
    smallTalk: ["greeting", "thanks", "ack"],
    thanksFor: ["for", "за"],

    /* ----- 2. Going to a section of the site -----
       "Go to the glossary" = 2 points; just "glossary" = 1 point
       (only in short messages). */
    sectionWords: {
        home: ["home", "home page", "homepage", "top", "main page", "start page", "главн*", "наверх", "начало", "домой"],
        lessons: ["lessons", "all lessons", "lesson list", "уроки", "уроков", "урокам"],
        lab: ["lab", "ai lab", "laboratory", "лаборатори*", "лабу"],
        quiz: ["quiz", "quizzes", "тест", "тесту", "викторин*"],
        glossary: ["glossary", "dictionary", "vocabulary", "terms", "словар*", "глоссари*", "термин*"],
        timeline: ["history", "timeline", "истори*", "хронолог*"],
        about: ["about", "about us", "about page", "about this site", "mission", "о проекте", "о сайте", "о нас", "миссия", "cas"]
    },

    navVerbs: ["go", "go to", "goto", "take me", "bring me", "open", "show", "show me", "navigate", "scroll",
        "jump", "where is", "where s", "перейди*", "перейти", "открой*", "открыть", "покажи*", "показать",
        "отведи*", "веди", "где", "прокрути*", "пролистай*", "хочу в", "хочу к"],

    /* ----- 3. Doing something or offering a button -----
       Words that show the person really wants the bot to DO something
       ("start the quiz", "switch to Russian"). Without them, a longer message
       like "how many questions does the quiz have?" only gets a button. */
    commandWords: ["start", "begin", "open", "launch", "play", "go", "take me", "bring me", "show me",
        "switch", "change", "turn", "make", "set", "enable", "put", "run", "let s", "lets", "i want", "i wanna",
        "i d like", "id like", "want to", "give me", "take the", "take a", "quiz me", "test me",
        "начни*", "начать", "начнем", "начинай", "запусти*", "запуск*", "открой*", "открыть", "включи*",
        "выключи*", "переключи*", "смени*", "сменить", "поменяй*", "поменять", "сделай*", "перейди*",
        "перейти", "покажи*", "давай", "хочу", "хочется", "пройти", "пройду", "поехали", "перенеси*",
        "отведи*", "проверь*", "проверить"],

    /* ----- 4. Messages that need a real person, not a script -----
       Someone in danger or in deep distress gets a calm answer that points
       to trusted adults and helplines. This is checked before anything else. */

    // Always serious, whatever else the message says
    crisisWords: ["want to die", "wanna die", "wish i was dead", "wish i were dead", "kill myself",
        "killing myself", "suicid*", "self harm*", "selfharm*", "hurt myself", "hurting myself", "harm myself",
        "cut myself", "cutting myself", "end my life", "take my life", "don t want to live", "dont want to live",
        "do not want to live", "no reason to live",
        "хочу умереть", "хочется умереть", "лучше бы я умер*", "покончить с собой", "покончу с собой",
        "суицид*", "самоубийств*", "не хочу жить", "не хочется жить", "жить не хочется", "жить не хочу",
        "незачем жить", "убить себя", "убью себя", "навредить себе", "причинить себе вред", "режу себя",
        "резать себя", "порезать себя", "селфхарм*"],

    // About the person, unless the message is about AI
    // ("I'm being bullied" -> help; "can AI stop bullying?" -> a normal answer)
    distressWords: ["hurting me", "hurts me", "hits me", "hit me again", "beat me up", "beats me up",
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
        "мне очень страшно", "мне так страшно", "я боюсь"],

    aiTopicWords: ["ai", "ии", "robot*", "робот*", "machine*", "машин*", "computer*", "компьютер*",
        "chatbot*", "chat", "чат*", "neural", "нейрон*", "нейросет*", "technolog*", "технолог*", "algorithm*",
        "алгоритм*", "artificial", "искусствен*", "skynet", "terminator*", "терминатор*", "deepfake*",
        "дипфейк*", "gpt*", "гпт", "chess", "шахмат*"],

    /* ----- 5. "What is X?" / "Define X" -----
       defineExplicit: the person clearly asks for a definition ("define", "meaning of").
       fillers: polite words skipped at the start ("please define ...").
       endings: skipped at the end ("what does overfitting mean").
       coverSkip: small words that don't change what a question is about. */
    defineExplicit: ["define", "definition of", "definition", "meaning of", "what does",
        "определение слова", "определение", "значение слова", "значение", "что значит", "что означает",
        "дай определение", "объясни слово", "объясни термин"],

    defineQuestion: ["what is a", "what is an", "what is the", "what is", "what s a", "what s an", "what s",
        "whats a", "whats", "what are", "who is", "explain", "tell me what", "что такое", "что это такое",
        "что это", "кто такой", "кто такая", "что за", "что делает", "что делают", "объясни", "расскажи что такое"],

    fillers: ["please", "pls", "so", "and", "hey", "ok", "okay", "um", "ну", "а", "скажи", "подскажи",
        "пожалуйста", "слушай"],

    endings: ["mean", "means", "stand for", "означает", "значит", "is", "это"],

    coverSkip: ["a", "an", "the", "of", "in", "on", "for", "about", "to", "is", "are", "do", "does", "and",
        "with", "by", "it", "its", "this", "that", "ai", "ии", "в", "во", "на", "о", "об", "про", "у", "и", "с",
        "для", "это", "этот", "эта", "такое", "ли"],

    /* ----- 6. Words for the theme, the language and the lab ----- */
    themeWords: {
        dark: ["dark", "night", "black", "темн*", "ночн*", "черн*"],
        light: ["light", "day", "white", "bright", "светл*", "дневн*", "бел*", "ярк*"],
        tooBright: ["too bright", "слишком ярко"],     // means: make it dark
        tooDark: ["too dark", "слишком темно"]         // means: make it light
    },

    languageWords: {
        ru: ["russian", "русск*", "по русски", "рус"],
        en: ["english", "английск*", "по английски", "англ*", "eng"],
        change: ["switch", "change", "переключи*", "смени*", "поменя*", "другой"],
        // In a message about AI (aiTopicWords), "language" / "язык" is about
        // the site only next to one of these words. So "How does AI
        // understand human language?" is a question about AI.
        context: ["russian", "english", "русск*", "английск*", "switch", "change", "переключи*", "смени*",
            "сменить", "поменя*", "site", "website", "page", "сайт*", "страниц*"]
    },

    // "Open the lab" with these words opens the next-word predictor
    predictorWords: ["predict*", "next word", "language model", "предсказ*", "следующ* слов*"],

    // Names that are written in Latin letters in Russian texts too
    // (so they don't count as English words)
    latinNames: ["eliza", "chatgpt", "gpt", "alphago", "alexa", "siri", "gemini", "claude", "copilot", "google",
        "openai", "deepmind", "midjourney", "turing", "python"],

    /* ----- 7. Simple answers and their buttons -----
       text: the answer (a text key from above).
       buttons, one of:
         { lesson: 4 }                open lesson 4
         { lab: "classifier" }        open the lab ("classifier" or "predictor")
         { section: "timeline" }      go to a section of the page
         { quiz: true }               start the quiz
         { ask: "fact", label: "assistant.chip.fact", icon: "💡" }
                                      ask the bot again (fact, joke, recommend, define)
       Answers that need numbers or other data (greetings, facts, lessons,
       the glossary...) are built in section 3 of js/assistant.js. */
    replies: {
        welcome: { text: "assistant.r.welcome" },
        thanks: { text: "assistant.r.thanks" },
        bye: { text: "assistant.r.bye" },
        howAreYou: { text: "assistant.r.howAreYou" },
        who: { text: "assistant.r.who", buttons: [{ lesson: 4 }] },
        help: { text: "assistant.r.help" },
        ai: { text: "assistant.r.ai", buttons: [{ lesson: 1 }] },
        ml: { text: "assistant.r.ml", buttons: [{ lesson: 2 }, { lab: "classifier" }] },
        nn: { text: "assistant.r.nn", buttons: [{ lesson: 3 }, { lab: "classifier" }] },
        llm: { text: "assistant.r.llm", buttons: [{ lesson: 4 }, { lab: "predictor" }] },
        hallucination: { text: "assistant.r.hallucination", buttons: [{ lesson: 4 }] },
        bias: { text: "assistant.r.bias", buttons: [{ lesson: 6 }] },
        privacy: { text: "assistant.r.privacy", buttons: [{ lesson: 6 }] },
        danger: { text: "assistant.r.danger", buttons: [{ lesson: 6 }] },
        homework: { text: "assistant.r.homework", buttons: [{ lesson: 4 }] },
        eliza: { text: "assistant.r.eliza", buttons: [{ section: "timeline" }] },
        conscious: { text: "assistant.r.conscious", buttons: [{ lesson: 1 }] },
        games: { text: "assistant.r.games", buttons: [{ section: "timeline" }] },
        sad: { text: "assistant.r.sad" },
        support: { text: "assistant.r.support" },
        about: { text: "assistant.r.about", buttons: [{ section: "about" }] },
        ack: {
            text: "assistant.r.ack",
            buttons: [
                { ask: "fact", label: "assistant.chip.fact", icon: "💡" },
                { ask: "recommend", label: "assistant.chip.lesson", icon: "📚" },
                { quiz: true }
            ]
        },
        quiz: { text: "assistant.r.quiz", buttons: [{ quiz: true }] },
        quizOffer: { text: "assistant.r.quizOffer", buttons: [{ quiz: true }] },
        lab: { text: "assistant.r.lab", buttons: [{ lab: "classifier" }, { lab: "predictor" }] },
        labOffer: { text: "assistant.r.labOffer", buttons: [{ lab: "classifier" }, { lab: "predictor" }] },
        themeDark: { text: "assistant.r.themeDark" },
        themeLight: { text: "assistant.r.themeLight" },
        noGlossary: { text: "assistant.r.noGlossary" },
        // after "tell me more", "example?" or "in simple words" with nothing to go on
        noTopic: { text: "assistant.r.noTopic" },
        noExample: { text: "assistant.r.noExample", buttons: [{ section: "glossary" }] },
        noSimple: { text: "assistant.r.noSimple", buttons: [{ section: "glossary" }] },
        noQuiz: { text: "assistant.r.noQuiz", buttons: [{ section: "quiz" }] }
    },

    /* ----- 8. The quick-question chips under the chat -----
       intent: what the bot answers; key: the chip's text */
    chips: [
        { intent: "ai", key: "assistant.chip.ai", icon: "🤖" },
        { intent: "recommend", key: "assistant.chip.lesson", icon: "📚" },
        { intent: "quizMe", key: "assistant.chip.quizMe", icon: "🎯" },
        { intent: "lab", key: "assistant.chip.lab", icon: "🧪" },
        { intent: "fact", key: "assistant.chip.fact", icon: "💡" },
        { intent: "define", key: "assistant.chip.define", icon: "📖" }
    ],

    /* ----- 9. Answers from the site (js/search.js) -----
       A question without a prepared answer is looked up in the site's
       lessons, glossary and timeline (see section 5 of js/assistant.js). */

    // Where the site tells more about a prepared answer: chips under it.
    // "glossary:ai" = the glossary's term "ai", "lessons:l1-s1" = lesson 1,
    // part 1 ("l1-keys": its key ideas), "timeline:e2" = milestone e2.
    replySources: {
        ai: ["glossary:ai", "lessons:l1-s1"],
        ml: ["glossary:ml", "lessons:l2-s1"],
        nn: ["glossary:neural-network", "lessons:l3-s1"],
        llm: ["glossary:llm", "lessons:l4-s2"],
        hallucination: ["glossary:hallucination", "lessons:l4-s3"],
        bias: ["glossary:bias", "lessons:l6-s1"],
        privacy: ["glossary:privacy", "lessons:l6-s3"],
        danger: ["lessons:l6-s2", "glossary:deepfake"],
        homework: ["lessons:l4-s4"],
        eliza: ["timeline:e4", "glossary:turing-test"],
        conscious: ["lessons:l1-s3", "glossary:agi"],
        games: ["timeline:e6", "timeline:e10"],
        history: ["timeline:e2", "timeline:e1"]
    },

    // The kinds of text an answer may come from (quiz questions are for "quiz me")
    answerTypes: ["glossary", "lessons", "timeline", "lab"],

    // Words that only shape a question ("who INVENTED the perceptron?", "how does
    // ChatGPT WORK?"): the bot leaves them out when it looks things up. (The
    // search leaves out "who", "what", "how"... by itself, and "AI" in a longer
    // question: js/content/search.js)
    askWords: ["invented", "invent", "invents", "inventor", "inventors", "created", "create", "creates",
        "made", "make", "makes", "built", "build", "happened", "happen", "happens", "work", "works",
        "working", "won", "win", "wins", "изобрел*", "придумал*", "создал*", "сделал*", "появил*", "случил*",
        "произошл*", "выиграл*", "получил*", "работает", "работают", "работать", "устроен*", "делает", "делают",
        "может", "могут", "можно"],

    // A question that starts with these asks for a date, so a milestone of the
    // timeline answers it before a prepared answer: "when was ChatGPT released?"
    whenWords: ["when", "what year", "which year", "in what year", "когда", "в каком году", "какого года"],

    // Question words that point to a kind of text. Its results count this much more:
    // "who / when" -> the timeline, "what is" -> the glossary, "how / why" -> the lessons
    searchBoosts: [
        { words: ["who", "when", "year", "invented", "inventor*", "created", "кто", "когда", "году", "год",
            "изобрел*", "придумал*", "создал*"], boost: { timeline: 1.5 } },
        { words: ["what is", "what are", "what s", "whats", "define", "meaning", "что такое", "что значит",
            "что означает", "значение", "определение"], boost: { glossary: 1.3 } },
        { words: ["how", "why", "как", "почему", "зачем"], boost: { lessons: 1.3 } }
    ],

    // Follow-ups about the last answer from the site (only small words around them:
    // "can you give me an example please"):
    // more = the next part of the same text, example = the glossary's example,
    // simpler = the glossary's short definition
    followUps: {
        more: ["tell me more", "more", "go on", "continue", "keep going", "what else", "and then", "read more",
            "more details", "расскажи подробнее", "подробнее", "расскажи еще", "еще", "дальше", "продолжай",
            "а дальше", "что еще", "читать дальше"],
        example: ["example", "examples", "for example", "an example", "give me an example", "give an example",
            "пример", "примеры", "например", "приведи пример", "дай пример", "для примера"],
        simpler: ["in simple words", "in simple terms", "simpler", "more simply", "simply", "explain simply",
            "in plain words", "eli5", "i don t understand", "too hard", "too complicated", "проще", "попроще",
            "простыми словами", "объясни проще", "скажи проще", "не понял", "не поняла", "непонятно",
            "не понятно", "сложно"]
    },
    followUpSkip: ["please", "pls", "can", "could", "you", "me", "give", "show", "say", "explain", "it", "that",
        "this", "of", "for", "about", "the", "a", "an", "some", "and", "so", "ok", "now", "bit", "little",
        "пожалуйста", "можно", "мне", "дай", "покажи", "скажи", "объясни", "это", "этого", "этом", "про",
        "об", "о", "а", "ну", "и", "так", "теперь", "давай", "чуть", "немного"],

    // "Quiz me" (optionally "on X" / "по X"): one question from the quiz, in the chat
    quizMe: ["quiz me", "test me", "ask me a question", "ask me something", "check my knowledge",
        "test my knowledge", "проверь меня", "спроси меня", "задай вопрос", "задай мне вопрос",
        "проверь мои знания", "погоняй меня"],
    // Small words between "quiz me" and its topic: "quiz me ON neural networks"
    quizTopicWords: ["on", "about", "in", "по", "про", "на", "тему", "о", "об"],
    // A true-or-false question can also be answered by typing a word
    quizAnswerWords: {
        yes: ["true", "right", "correct", "верно", "правда", "правильно"],
        no: ["false", "wrong", "incorrect", "неверно", "ложь", "неправда", "неправильно"]
    }
});
