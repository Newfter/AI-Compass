/* =========================================================
   AI COMPASS — TEXTS AND WORD LISTS: SITE SEARCH
   Every word in English and in Russian (informal "ты"), then the
   lists the search engine uses (at the bottom):
   - stopWords: little words that are skipped ("the", "что");
   - synonyms: words and phrases that mean the same thing, in both
     languages (a search for one also finds the others);
   - related: one-way links ("chatgpt" also finds "chatbot", but a
     search for "chatbot" does not look for "chatgpt");
   - everywhere: what every text of the site is about ("AI"), skipped
     when a query has other words;
   - pages: the parts of the page searched as a whole (the hero,
     About and the section headers).
   Used by js/search.js (and through it by the Ctrl+K palette and
   Compass Bot). To change a text, change it here (in both languages).
   Write the lists in lower case; "ё" and "е" count as the same letter.
   ========================================================= */

window.AICompass.addTranslations({
    en: {
        // Where a result comes from, shown next to its title
        "search.lesson": "Lesson {n} · {title}",
        "search.keyIdeas": "Key ideas",
        "search.glossary": "Glossary",
        "search.glossaryLabel": "Glossary · {title}",
        "search.timeline": "History · {year}",
        "search.quiz": "Quiz · {topic}",
        "search.trueFalse": "True or false: {text}",
        "search.lab": "AI Lab",
        "search.labLabel": "AI Lab · {title}",
        "search.page": "Page · {name}"
    },
    ru: {
        "search.lesson": "Урок {n} · {title}",
        "search.keyIdeas": "Главное",
        "search.glossary": "Словарь",
        "search.glossaryLabel": "Словарь · {title}",
        "search.timeline": "История · {year}",
        "search.quiz": "Тест · {topic}",
        "search.trueFalse": "Верно или нет: {text}",
        "search.lab": "ИИ-лаборатория",
        "search.labLabel": "ИИ-лаборатория · {title}",
        "search.page": "Страница · {name}"
    }
});

window.AICompass.content.set("search", {
    /* ----- Little words that are skipped -----
       They are in almost every sentence, so they would only add noise.
       Question words are here too: "what is a token" searches for "token".
       So are words that only judge (good, bad, better, best...): they name
       no topic, and a text that happens to use them ("rewards for good
       results and penalties for bad ones") does not answer "is AI good or bad?". */
    stopWords: {
        en: [
            "a", "an", "the", "and", "or", "but", "if", "so", "of", "to", "in", "on", "at", "by",
            "for", "from", "with", "without", "about", "into", "onto", "over", "under", "than",
            "then", "that", "this", "these", "those", "it", "its", "is", "are", "was", "were",
            "be", "been", "being", "am", "do", "does", "did", "done", "can", "could", "will",
            "would", "shall", "should", "may", "might", "must", "have", "has", "had", "i", "me",
            "my", "you", "your", "we", "us", "our", "they", "them", "their", "he", "him", "his",
            "she", "her", "who", "whom", "whose", "which", "what", "whats", "when", "where", "why",
            "how", "there", "here", "some", "any", "each", "every", "all", "both", "no", "not",
            "yes", "ok", "okay", "please", "just", "also", "too", "very", "really", "quite",
            "much", "many", "such", "as", "up", "out", "again", "only", "tell", "explain",
            "describe", "define", "definition", "mean", "means", "meaning", "know", "want",
            "thing", "things", "something", "stuff", "get", "hi", "hello", "hey",
            "good", "bad", "better", "worse", "best", "worst"
        ],
        ru: [
            "а", "без", "более", "бы", "был", "была", "были", "было", "быть", "в", "вам", "вас",
            "весь", "во", "вот", "все", "всего", "всех", "вы", "где", "да", "даже", "для", "до",
            "его", "ее", "если", "есть", "еще", "же", "за", "здесь", "и", "из", "или", "им",
            "их", "к", "как", "какая", "какие", "какой", "каком", "ко", "когда", "кто", "ли",
            "либо", "мне", "меня", "мы", "на", "над", "нам", "нас", "не", "него", "нее", "нет",
            "ни", "них", "но", "ну", "о", "об", "однако", "он", "она", "они", "оно", "от",
            "очень", "по", "под", "при", "про", "с", "со", "так", "также", "такой", "такое",
            "такая", "такие", "там", "те", "тем", "то", "того", "тоже", "той", "только", "том",
            "ты", "у", "уже", "хотя", "чего", "чем", "что", "чтобы", "эта", "эти", "это", "этого",
            "этой", "этом", "этот", "эту", "я", "расскажи", "расскажите", "объясни",
            "объясните", "скажи", "скажите", "покажи", "пожалуйста", "значит", "означает",
            "зачем", "почему", "привет", "ой", "вообще", "кому", "кого", "мой", "моя", "мое", "мои",
            "моего", "моей", "моему", "моим", "моих", "моими", "мою", "твой", "твоя", "твое", "твои",
            "твоего", "твоей", "твоих", "твоим", "твою", "свой", "своя", "свое", "свои", "своего",
            "своей", "своих", "своим", "свою",
            "хорошо", "плохо", "хороший", "хорошая", "хорошее", "хорошие", "плохой", "плохая", "плохое",
            "плохие", "лучше", "хуже", "лучший", "лучшая", "лучшее", "лучшие", "худший", "самый", "самая",
            "самое", "самые"
        ]
    },

    /* ----- Words that mean the same thing (both ways) -----
       Each line is one group. A search for any of them also finds the others,
       a little lower than the exact words you typed. */
    synonyms: [
        ["ai", "artificial intelligence", "ии", "искусственный интеллект"],
        ["neural network", "neural net", "нейросеть", "нейронная сеть", "нейронка"],
        ["llm", "large language model", "language model", "большая языковая модель", "языковая модель", "бям"],
        ["machine learning", "ml", "машинное обучение"],
        ["deep learning", "глубокое обучение"],
        ["chatbot", "chat bot", "чат-бот", "чатбот"],
        ["neuron", "нейрон"],
        ["perceptron", "перцептрон", "персептрон"],
        ["dataset", "data set", "training data", "набор данных", "датасет", "обучающие данные"],
        ["hallucination", "галлюцинация"],
        ["bias", "предвзятость"],
        ["computer vision", "компьютерное зрение"],
        ["generative ai", "генеративный ии"],
        ["token", "токен"],
        ["prompt", "промпт"],
        ["deepfake", "deep fake", "дипфейк"],
        ["robot", "робот"],
        ["algorithm", "алгоритм"],
        ["parameter", "weight", "параметр", "вес"],
        ["turing test", "тест тьюринга"],
        ["agi", "general ai", "общий ии", "сильный ии"],
        ["reinforcement learning", "обучение с подкреплением"],
        ["supervised learning", "обучение с учителем"],
        ["unsupervised learning", "обучение без учителя"],
        ["overfitting", "переобучение"],
        ["transformer", "трансформер"],
        ["privacy", "приватность", "конфиденциальность"],
        ["nlp", "natural language processing", "обработка естественного языка"],
        ["eliza", "элиза"],
        ["voice assistant", "голосовой помощник"],
        ["recommendation", "рекомендация"],
        ["black box", "черный ящик"],
        // names from the timeline, typed apart or in Russian letters
        ["alphago", "alpha go", "альфаго", "альфа го"],
        ["alphafold", "alpha fold", "альфафолд"],
        ["alexnet", "алекснет"],
        ["deep blue", "дип блю"]
    ],

    /* ----- What every text of the site is about -----
       In a query with other words, these don't help to find the right
       text, so they are skipped: "how does AI recognise faces?" looks
       for "recognise faces", "AI winter" for "winter". Alone ("AI"), or
       inside a longer name ("generative AI"), they still count. */
    everywhere: ["ai", "artificial intelligence", "ии", "искусственный интеллект"],

    /* ----- One-way links -----
       A search for the word on the left also looks for the words on the right
       (names of real products lead to what they are). */
    related: {
        "chatgpt": ["chatbot", "large language model"],
        "gpt": ["large language model"],
        "gemini": ["chatbot", "large language model"],
        "claude": ["chatbot", "large language model"],
        "copilot": ["chatbot", "large language model"],
        "гигачат": ["чат-бот", "большая языковая модель"],
        "чатгпт": ["chatgpt", "чат-бот", "большая языковая модель"],
        "алиса": ["голосовой помощник", "чат-бот"],
        "siri": ["voice assistant"],
        "alexa": ["voice assistant"],
        "midjourney": ["generative ai", "генеративный ии"],
        "dalle": ["generative ai", "генеративный ии"],
        "нейронки": ["нейросеть"]
    },

    /* ----- Parts of the page searched as a whole -----
       id: the section's id in index.html (the result goes there).
       title, text: the keys of its title and of its text (joined with a space).
       keywords: keys of more words to find it by, never shown (the small
       capital-letter labels above the titles). */
    pages: [
        { id: "home", title: ["hero.titleStart", "hero.titleAccent"], text: ["hero.subtitle"], keywords: ["hero.label"] },
        { id: "lessons", title: ["lessons.title"], text: ["lessons.subtitle"], keywords: ["lessons.label"] },
        { id: "lab", title: ["lab.title"], text: ["lab.subtitle"], keywords: ["lab.label"] },
        { id: "quiz", title: ["quiz.title"], text: ["quiz.subtitle"], keywords: ["quiz.label"] },
        { id: "glossary", title: ["glossary.title"], text: ["glossary.subtitle"], keywords: ["glossary.label"] },
        { id: "timeline", title: ["timeline.title"], text: ["timeline.subtitle"], keywords: ["timeline.label"] },
        {
            id: "about",
            title: ["about.title"],
            text: ["about.text", "about.value1Title", "about.value1Text", "about.value2Title",
                "about.value2Text", "about.value3Title", "about.value3Text"],
            keywords: ["about.label"]
        }
    ]
});
