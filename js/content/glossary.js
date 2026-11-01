/* =========================================================
   AI COMPASS — TEXTS: GLOSSARY
   Every word of the glossary in English and in Russian (informal "ты").
   The terms themselves (and their categories) are in a second file,
   js/content/glossary-terms.js, so that this one stays short.
   Used by js/glossary.js (and the glossary section of index.html).
   To change a text, change it here (in both languages).
   ========================================================= */

// The section's title and subtitle on the page (index.html). The subtitle names the
// number of terms: {n} comes from js/glossary.js (the text value "glossaryTermCount").
window.AICompass.addTranslations({
    en: {
        "glossary.label": "SPEAK THE LANGUAGE",
        "glossary.title": "AI Glossary",
        "glossary.subtitle": "The key words of Artificial Intelligence, explained simply.",
        "glossary.subtitle.one": "{n} key word of Artificial Intelligence, explained simply. Search it, open it, learn it with flashcards.",
        "glossary.subtitle.many": "{n} key words of Artificial Intelligence, explained simply. Search them, open them, learn them with flashcards."
    },
    ru: {
        "glossary.label": "ГОВОРИ НА ЯЗЫКЕ ИИ",
        "glossary.title": "Словарь ИИ",
        "glossary.subtitle": "Главные слова искусственного интеллекта простыми словами.",
        "glossary.subtitle.one": "{n} главное понятие искусственного интеллекта простыми словами. Ищи, открывай, учи по карточкам.",
        "glossary.subtitle.few": "{n} главных понятия искусственного интеллекта простыми словами. Ищи, открывай, учи по карточкам.",
        "glossary.subtitle.many": "{n} главных понятий искусственного интеллекта простыми словами. Ищи, открывай, учи по карточкам."
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
        "glossary.cat.vision": "Computer vision",
        "glossary.cat.trial": "Trial and error",
        "glossary.cat.language": "Language models",
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
        "glossary.more": "Read more",
        "glossary.moreLabel": "Read more: {term}",
        "glossary.example": "Everyday example",
        "glossary.related": "Related terms",
        "glossary.learn": "Learn it on this site",
        "glossary.lessonLink": "Lesson {n}: {title}",
        "glossary.labLink": "AI Lab: {title}",
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
        "glossary.cmdTitle": "Glossary: {term}",
        "glossary.cmdStudy": "Study flashcards",
        "glossary.cmdToday": "Term of the day: {term}",

        // The top of the glossary: the term of the day...
        "glossary.today": "Term of the day",
        "glossary.todayMore": "Learn more",
        "glossary.todayMoreLabel": "Learn more about {term}",

        // ...and the flashcards ({n}, {review} and {fresh} come from js/glossary.js)
        "glossary.cards": "Flashcards",
        "glossary.cardsDue.one": "{n} card to study today",
        "glossary.cardsDue.many": "{n} cards to study today",
        "glossary.cardsNone": "All done for today",
        "glossary.cardsSplit": "To repeat: {review} · New: {fresh}",
        "glossary.cardsNext": "Next cards: {when}",
        "glossary.cardsFirst": "Learn the words one card at a time: the ones you know come back later, the hard ones sooner.",
        "glossary.cardsStudy": "Study with flashcards",
        "glossary.cardsLoadFailed": "The flashcards could not load. Check your internet connection and try again.",
        "glossary.cardsSaved": "Your cards are saved only in this browser.",
        "glossary.cardsNotSaved": "This browser doesn't let the site save: your cards are kept only while the page is open.",
        "glossary.boxesLabel": "Your flashcard boxes",
        "glossary.boxNew": "New",
        "glossary.box": "Box {n}",
        "glossary.boxCards.one": "{n} card",
        "glossary.boxCards.many": "{n} cards",
        "glossary.boxEvery": "every session",
        "glossary.boxAfter.one": "after {n} day",
        "glossary.boxAfter.many": "after {n} days",
        "glossary.whenToday": "today",
        "glossary.whenTomorrow": "tomorrow",

        // The flashcards window (js/glossary-cards.js)
        "glossary.fc.title": "Flashcards",
        "glossary.fc.close": "Close the flashcards",
        "glossary.fc.deck": "Deck",
        "glossary.fc.deckAll": "All terms",
        "glossary.fc.deckCats": "Categories",
        "glossary.fc.deckLessons": "Lessons",
        "glossary.fc.deckLesson": "Lesson {n}: {title}",
        "glossary.fc.deckLessonNumber": "Lesson {n}",
        "glossary.fc.progress": "Card {n} of {total}",
        "glossary.fc.new": "New card",
        "glossary.fc.inBox": "Box {n}",
        "glossary.fc.think": "What does it mean? Think, then flip the card.",
        "glossary.fc.flipHint": "Press Space or Enter to flip the card.",
        "glossary.fc.no": "Not yet",
        "glossary.fc.yes": "I knew it",
        "glossary.fc.keys": "Space: flip · ←: not yet · →: I knew it",
        "glossary.fc.sayCard": "Card {n} of {total}: {term}",
        "glossary.fc.sayBack": "{term}: {short}",
        "glossary.fc.movedUp": "{term}: box {box}, back {when}.",
        "glossary.fc.movedBack": "{term}: back to box 1, it comes back next session.",
        "glossary.fc.whenSession": "next session",
        "glossary.fc.whenTomorrow": "tomorrow",
        "glossary.fc.whenDays.one": "in {n} day",
        "glossary.fc.whenDays.many": "in {n} days",
        "glossary.fc.doneTitle": "Session complete!",
        "glossary.fc.doneScore.one": "You knew {k} of {n} card.",
        "glossary.fc.doneScore.many": "You knew {k} of {n} cards.",
        "glossary.fc.donePerfect": "You knew every card. Excellent memory!",
        "glossary.fc.doneMissed.one": "{n} card is back in box 1: it comes back next session.",
        "glossary.fc.doneMissed.many": "{n} cards are back in box 1: they come back next session.",
        "glossary.fc.emptyTitle": "Nothing to study in this deck today",
        "glossary.fc.emptyText": "Cards come back when it is time to repeat them.",
        "glossary.fc.next": "Next cards in this deck: {when}",
        "glossary.fc.allInBoxes": "Every card of this deck is in your boxes.",
        "glossary.fc.more.one": "Study {n} more card",
        "glossary.fc.more.many": "Study {n} more cards",
        "glossary.fc.learnNew.one": "Learn {n} new card",
        "glossary.fc.learnNew.many": "Learn {n} new cards",
        "glossary.fc.closeButton": "Close",
        "glossary.fc.boxesTitle": "Your boxes in this deck",
        "glossary.fc.how": "Know a card? It moves up a box and comes back later. Not yet? It goes back to box 1 and comes back next session."
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
        "glossary.cat.vision": "Компьютерное зрение",
        "glossary.cat.trial": "Пробы и ошибки",
        "glossary.cat.language": "Языковые модели",
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
        "glossary.more": "Подробнее",
        "glossary.moreLabel": "Подробнее: {term}",
        "glossary.example": "Пример из жизни",
        "glossary.related": "Связанные термины",
        "glossary.learn": "Где изучить на сайте",
        "glossary.lessonLink": "Урок {n}. {title}",
        "glossary.labLink": "ИИ-лаборатория: {title}",
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
        "glossary.cmdTitle": "Словарь: {term}",
        "glossary.cmdStudy": "Учить по карточкам",
        "glossary.cmdToday": "Термин дня: {term}",

        // The top of the glossary: the term of the day...
        "glossary.today": "Термин дня",
        "glossary.todayMore": "Подробнее",
        "glossary.todayMoreLabel": "Подробнее о термине «{term}»",

        // ...and the flashcards ({n}, {review} and {fresh} come from js/glossary.js)
        "glossary.cards": "Карточки",
        "glossary.cardsDue.one": "{n} карточка на сегодня",
        "glossary.cardsDue.few": "{n} карточки на сегодня",
        "glossary.cardsDue.many": "{n} карточек на сегодня",
        "glossary.cardsNone": "На сегодня всё",
        "glossary.cardsSplit": "Повторить: {review} · Новых: {fresh}",
        "glossary.cardsNext": "Следующие карточки: {when}",
        "glossary.cardsFirst": "Учи слова по одной карточке: те, что знаешь, вернутся позже, а трудные — скорее.",
        "glossary.cardsStudy": "Учить по карточкам",
        "glossary.cardsLoadFailed": "Не удалось загрузить карточки. Проверь подключение к интернету и попробуй ещё раз.",
        "glossary.cardsSaved": "Твои карточки хранятся только в этом браузере.",
        "glossary.cardsNotSaved": "Этот браузер не даёт сайту сохранять данные: карточки сохранятся, только пока открыта страница.",
        "glossary.boxesLabel": "Твои коробки с карточками",
        "glossary.boxNew": "Новые",
        "glossary.box": "Коробка {n}",
        "glossary.boxCards.one": "{n} карточка",
        "glossary.boxCards.few": "{n} карточки",
        "glossary.boxCards.many": "{n} карточек",
        "glossary.boxEvery": "каждое занятие",
        "glossary.boxAfter.one": "через {n} день",
        "glossary.boxAfter.few": "через {n} дня",
        "glossary.boxAfter.many": "через {n} дней",
        "glossary.whenToday": "сегодня",
        "glossary.whenTomorrow": "завтра",

        // The flashcards window (js/glossary-cards.js)
        "glossary.fc.title": "Карточки",
        "glossary.fc.close": "Закрыть карточки",
        "glossary.fc.deck": "Колода",
        "glossary.fc.deckAll": "Все термины",
        "glossary.fc.deckCats": "Категории",
        "glossary.fc.deckLessons": "Уроки",
        "glossary.fc.deckLesson": "Урок {n}. {title}",
        "glossary.fc.deckLessonNumber": "Урок {n}",
        "glossary.fc.progress": "Карточка {n} из {total}",
        "glossary.fc.new": "Новая карточка",
        "glossary.fc.inBox": "Коробка {n}",
        "glossary.fc.think": "Что это значит? Подумай и переверни карточку.",
        "glossary.fc.flipHint": "Нажми пробел или Enter, чтобы перевернуть карточку.",
        "glossary.fc.no": "Пока нет",
        "glossary.fc.yes": "Знаю",
        "glossary.fc.keys": "Пробел — перевернуть · ← — пока нет · → — знаю",
        "glossary.fc.sayCard": "Карточка {n} из {total}: {term}",
        "glossary.fc.sayBack": "{term}: {short}",
        "glossary.fc.movedUp": "«{term}»: коробка {box}, вернётся {when}.",
        "glossary.fc.movedBack": "«{term}»: снова в коробке 1, вернётся на следующем занятии.",
        "glossary.fc.whenSession": "на следующем занятии",
        "glossary.fc.whenTomorrow": "завтра",
        "glossary.fc.whenDays.one": "через {n} день",
        "glossary.fc.whenDays.few": "через {n} дня",
        "glossary.fc.whenDays.many": "через {n} дней",
        "glossary.fc.doneTitle": "Занятие окончено!",
        "glossary.fc.doneScore.one": "«Знаю»: {k} из {n} карточки.",
        "glossary.fc.doneScore.few": "«Знаю»: {k} из {n} карточек.",
        "glossary.fc.doneScore.many": "«Знаю»: {k} из {n} карточек.",
        "glossary.fc.donePerfect": "Ты знаешь все карточки. Отличная память!",
        "glossary.fc.doneMissed.one": "{n} карточка снова в коробке 1: она вернётся на следующем занятии.",
        "glossary.fc.doneMissed.few": "{n} карточки снова в коробке 1: они вернутся на следующем занятии.",
        "glossary.fc.doneMissed.many": "{n} карточек снова в коробке 1: они вернутся на следующем занятии.",
        "glossary.fc.emptyTitle": "В этой колоде на сегодня всё",
        "glossary.fc.emptyText": "Карточки возвращаются, когда их пора повторить.",
        "glossary.fc.next": "Следующие карточки этой колоды: {when}",
        "glossary.fc.allInBoxes": "Все карточки этой колоды уже в твоих коробках.",
        "glossary.fc.more.one": "Учить ещё {n} карточку",
        "glossary.fc.more.few": "Учить ещё {n} карточки",
        "glossary.fc.more.many": "Учить ещё {n} карточек",
        "glossary.fc.learnNew.one": "Взять {n} новую карточку",
        "glossary.fc.learnNew.few": "Взять {n} новые карточки",
        "glossary.fc.learnNew.many": "Взять {n} новых карточек",
        "glossary.fc.closeButton": "Закрыть",
        "glossary.fc.boxesTitle": "Твои коробки в этой колоде",
        "glossary.fc.how": "Знаешь карточку — она переходит в следующую коробку и вернётся позже. Пока нет — она снова в коробке 1 и вернётся на следующем занятии."
    }
});
