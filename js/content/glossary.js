/* =========================================================
   AI COMPASS — TEXTS: GLOSSARY
   Every word of the glossary in English and in Russian (informal "ты").
   The terms themselves (and their categories) are in a second file,
   js/content/glossary-terms.js, so that this one stays short.
   Used by js/glossary.js (and the glossary section of index.html).
   To change a text, change it here (in both languages).
   ========================================================= */

// The section's title and subtitle on the page (index.html)
window.AICompass.addTranslations({
    en: {
        "glossary.label": "SPEAK THE LANGUAGE",
        "glossary.title": "AI Glossary",
        "glossary.subtitle": "The key words of Artificial Intelligence, explained simply."
    },
    ru: {
        "glossary.label": "ГОВОРИ НА ЯЗЫКЕ ИИ",
        "glossary.title": "Словарь ИИ",
        "glossary.subtitle": "Главные слова искусственного интеллекта простыми словами."
    }
});

// The glossary's own texts
window.AICompass.addTranslations({
    en: {
        // The search box and the buttons next to it
        "glossary.kicker": "Bilingual AI dictionary",
        "glossary.searchLabel": "Search the glossary",
        "glossary.searchPlaceholder": "Search, e.g. “bias” or “robot”",
        "glossary.searchPlaceholderShort": "Search terms…",
        "glossary.searchHint": "Results update as you type. Press Enter to open the first result, or Escape to clear the search.",
        "glossary.clear": "Clear search",
        "glossary.random": "Random term",
        "glossary.randomLabel": "Show a random term",
        "glossary.randomAnnounce": "Random term: {term}",

        // Filters: category chips and the alphabet strip
        "glossary.filters": "Filters",
        "glossary.filtersActive": "active filters:",
        "glossary.catsLabel": "Filter by category",
        "glossary.cat.all": "All",
        "glossary.cat.basics": "Basics",
        "glossary.cat.learning": "Learning",
        "glossary.cat.generative": "Generative AI",
        "glossary.cat.ethics": "Ethics & Safety",
        "glossary.lettersLabel": "Filter by first letter",
        "glossary.lettersAll": "A–Z",
        "glossary.lettersAllLabel": "All letters",
        "glossary.letterLabel": "Terms starting with {letter}",

        // Counts, progress and the reset button ({n} and {total} come from js/glossary.js)
        "glossary.count.one": "Showing {n} of {total} terms",
        "glossary.count.many": "Showing {n} of {total} terms",
        "glossary.explored": "Explored",
        "glossary.exploredLabel": "Terms you have opened: {n} of {total}",
        "glossary.exploredBadge": "You have already explored this term",
        "glossary.allExplored": "Every glossary term explored — great work!",
        "glossary.reset": "Reset filters",

        // The term cards
        "glossary.gridLabel": "Glossary terms",
        "glossary.more": "Example & related",
        "glossary.moreLabel": "Example & related: {term}",
        "glossary.example": "Everyday example",
        "glossary.related": "Related terms",
        "glossary.altCode": "RU",
        "glossary.altLabel": "In Russian:",

        // When nothing is found
        "glossary.emptyQuery": "Nothing found for “{query}”",
        "glossary.emptyFilters": "No terms match these filters",
        "glossary.emptyHint": "Try another word, check the spelling or reset the filters.",
        "glossary.suggest": "Did you mean:",

        // The "show all" button under the cards
        "glossary.showAll.one": "Show all {n} terms",
        "glossary.showAll.many": "Show all {n} terms",
        "glossary.showLess": "Show fewer terms",

        // Command palette (Ctrl+K): one command per term
        "glossary.cmdGroup": "Glossary",
        "glossary.cmdTitle": "Glossary: {term}"
    },
    ru: {
        // The search box and the buttons next to it
        "glossary.kicker": "Двуязычный словарь ИИ",
        "glossary.searchLabel": "Поиск по словарю",
        "glossary.searchPlaceholder": "Например, «нейросеть»",
        "glossary.searchPlaceholderShort": "Найти термин…",
        "glossary.searchHint": "Результаты обновляются, пока ты печатаешь. Нажми Enter, чтобы открыть первый результат, или Escape, чтобы очистить поиск.",
        "glossary.clear": "Очистить поиск",
        "glossary.random": "Случайный термин",
        "glossary.randomLabel": "Показать случайный термин",
        "glossary.randomAnnounce": "Случайный термин: {term}",

        // Filters: category chips and the alphabet strip
        "glossary.filters": "Фильтры",
        "glossary.filtersActive": "включено фильтров:",
        "glossary.catsLabel": "Фильтр по категориям",
        "glossary.cat.all": "Все",
        "glossary.cat.basics": "Основы",
        "glossary.cat.learning": "Обучение",
        "glossary.cat.generative": "Генеративный ИИ",
        "glossary.cat.ethics": "Этика и безопасность",
        "glossary.lettersLabel": "Фильтр по первой букве",
        "glossary.lettersAll": "А–Я",
        "glossary.lettersAllLabel": "Все буквы",
        "glossary.letterLabel": "Термины на букву {letter}",

        // Counts, progress and the reset button ({n} and {total} come from js/glossary.js)
        "glossary.count.one": "Показан {n} термин из {total}",
        "glossary.count.few": "Показано {n} термина из {total}",
        "glossary.count.many": "Показано {n} терминов из {total}",
        "glossary.explored": "Изучено",
        "glossary.exploredLabel": "Открытые тобой термины: {n} из {total}",
        "glossary.exploredBadge": "Этот термин уже изучен",
        "glossary.allExplored": "Все термины словаря изучены — отличная работа!",
        "glossary.reset": "Сбросить фильтры",

        // The term cards
        "glossary.gridLabel": "Термины словаря",
        "glossary.more": "Пример и связанные термины",
        "glossary.moreLabel": "Пример и связанные термины: {term}",
        "glossary.example": "Пример из жизни",
        "glossary.related": "Связанные термины",
        "glossary.altCode": "EN",
        "glossary.altLabel": "По-английски:",

        // When nothing is found
        "glossary.emptyQuery": "По запросу «{query}» ничего не найдено",
        "glossary.emptyFilters": "С такими фильтрами терминов нет",
        "glossary.emptyHint": "Попробуй другое слово, проверь написание или сбрось фильтры.",
        "glossary.suggest": "Возможно, имелось в виду:",

        // The "show all" button under the cards
        "glossary.showAll.one": "Показать все {n} термин",
        "glossary.showAll.few": "Показать все {n} термина",
        "glossary.showAll.many": "Показать все {n} терминов",
        "glossary.showLess": "Показать меньше терминов",

        // Command palette (Ctrl+K): one command per term
        "glossary.cmdGroup": "Словарь",
        "glossary.cmdTitle": "Словарь: {term}"
    }
});
