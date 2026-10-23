const translations = {
en: {
navHome: "Home",
navLessons: "Lessons",
navAbout: "About",
heroLabel: "YOUR AI JOURNEY STARTS HERE",
heroTitle: 'Navigate the World of <span>AI</span>',
heroSubtitle: "Your guide to understanding Artificial Intelligence.",
heroButton: "Explore Lessons",
lessonsLabel: "LEARN SOMETHING NEW",
lessonsTitle: "Explore the Basics",
lesson1Title: "What is AI?",
lesson1Text: "Discover what Artificial Intelligence is and how it works.",
lesson1More: 'Artificial Intelligence is when computers do tasks that usually need human thinking, like understanding speech, recognising pictures or answering questions. AI does not really "think" like a person: it finds patterns in huge amounts of examples and uses them to make its best guess.',
lesson2Title: "Machine Learning",
lesson2Text: "Learn how machines learn from data and improve.",
lesson2More: 'Machine learning is how most AI is built. Instead of writing every rule by hand, we show the computer thousands of examples, such as photos labelled "cat" or "dog". It slowly adjusts itself until its answers are mostly right, and the more good examples it sees, the better it gets.',
lesson3Title: "AI in Everyday Life",
lesson3Text: "See how AI is already part of your daily life.",
lesson3More: "You probably use AI every day: face unlock on your phone, video and music recommendations, map apps that predict traffic, spam filters in your email, and translators. Chatbots that answer questions and help with ideas are AI too.",
lesson4Title: "AI Ethics",
lesson4Text: "Explore the challenges and responsibilities of AI.",
lesson4More: "AI can make mistakes and can copy unfair ideas hidden in the data it learned from. That is why it matters to check important facts, protect your personal information, and be honest about when you used AI in your work. People, not machines, stay responsible for decisions.",
readLesson: "Read lesson",
closeLesson: "Close",
aboutLabel: "OUR MISSION",
aboutTitle: "About AI Compass",
aboutText: "AI Compass is your starting point for exploring the world of Artificial Intelligence.",
footerText: "Made for curious minds.",
backToTop: "Back to top ↑"
},
ru: {
    navHome: "Главная",
    navLessons: "Уроки",
    navAbout: "О проекте",
    heroLabel: "ТВОЁ ПУТЕШЕСТВИЕ В МИР ИИ НАЧИНАЕТСЯ ЗДЕСЬ",
    heroTitle: 'Исследуй мир <span>ИИ</span>',
    heroSubtitle: "Твой путеводитель по миру искусственного интеллекта.",
    heroButton: "Изучить уроки",
    lessonsLabel: "УЗНАЙ ЧТО-ТО НОВОЕ",
    lessonsTitle: "Изучаем основы",
    lesson1Title: "Что такое ИИ?",
    lesson1Text: "Узнай, что такое искусственный интеллект и как он работает.",
    lesson1More: "Искусственный интеллект — это когда компьютер выполняет задачи, для которых обычно нужно человеческое мышление: понимает речь, узнаёт картинки или отвечает на вопросы. ИИ не «думает» как человек: он находит закономерности в огромном количестве примеров и на их основе делает самое вероятное предположение.",
    lesson2Title: "Машинное обучение",
    lesson2Text: "Узнай, как машины учатся на данных и совершенствуются.",
    lesson2More: "Большинство систем ИИ создаётся с помощью машинного обучения. Вместо того чтобы прописывать каждое правило вручную, компьютеру показывают тысячи примеров, например фотографии с подписями «кошка» или «собака». Он постепенно подстраивается, пока его ответы не станут в основном верными, и чем больше хороших примеров он видит, тем лучше работает.",
    lesson3Title: "ИИ в повседневной жизни",
    lesson3Text: "Посмотри, как искусственный интеллект уже стал частью нашей жизни.",
    lesson3More: "Скорее всего, ты пользуешься ИИ каждый день: разблокировка телефона по лицу, рекомендации видео и музыки, карты, которые предсказывают пробки, фильтры спама в почте и переводчики. Чат-боты, которые отвечают на вопросы и помогают с идеями, — это тоже ИИ.",
    lesson4Title: "Этика ИИ",
    lesson4Text: "Изучи проблемы и ответственность, связанные с ИИ.",
    lesson4More: "ИИ может ошибаться и повторять несправедливые идеи, скрытые в данных, на которых он учился. Поэтому важно проверять важные факты, защищать свои личные данные и честно говорить, когда ты использовал ИИ в своей работе. Ответственность за решения остаётся за людьми, а не за машинами.",
    readLesson: "Читать урок",
    closeLesson: "Закрыть",
    aboutLabel: "НАША МИССИЯ",
    aboutTitle: "Об AI Compass",
    aboutText: "AI Compass — твоя отправная точка для изучения мира искусственного интеллекта.",
    footerText: "Создано для любознательных умов.",
    backToTop: "Наверх ↑"
}
};

document.addEventListener("DOMContentLoaded", function () {
const languageButton = document.getElementById("language-toggle");

if (!languageButton) {
    console.error('Button #language-toggle was not found.');
    return;
}

// Remember the language the visitor chose last time (if the browser allows it)
let currentLanguage = "en";
try {
    if (localStorage.getItem("language") === "ru") {
        currentLanguage = "ru";
    }
} catch (error) {}

// Shows the "Read lesson" / "Close" text in the current language
function updateLessonButtons() {
    document.querySelectorAll(".lesson-toggle").forEach(function (button) {
        const isOpen = button.getAttribute("aria-expanded") === "true";
        button.textContent = translations[currentLanguage][isOpen ? "closeLesson" : "readLesson"];
    });
}

function applyLanguage() {
    document.documentElement.lang = currentLanguage;

    document.querySelectorAll("[data-i18n]").forEach(function (element) {
        const key = element.getAttribute("data-i18n");
        const translation = translations[currentLanguage][key];

        if (translation !== undefined) {
            element.innerHTML = translation;
        }
    });

    languageButton.textContent = currentLanguage === "en" ? "RU" : "EN";
    updateLessonButtons();
}

languageButton.addEventListener("click", function () {
    currentLanguage = currentLanguage === "en" ? "ru" : "en";

    try {
        localStorage.setItem("language", currentLanguage);
    } catch (error) {}

    applyLanguage();
});

// Open and close the full text of each lesson card
document.querySelectorAll(".lesson-toggle").forEach(function (button) {
    button.addEventListener("click", function () {
        const lessonText = document.getElementById(button.getAttribute("aria-controls"));
        const isOpen = button.getAttribute("aria-expanded") === "true";

        button.setAttribute("aria-expanded", String(!isOpen));
        lessonText.hidden = isOpen;
        button.closest(".lesson-card").classList.toggle("is-open", !isOpen);
        updateLessonButtons();
    });
});

// Make the top menu solid once the page is scrolled
const navbar = document.querySelector(".navbar");
window.addEventListener("scroll", function () {
    navbar.classList.toggle("scrolled", window.scrollY > 10);
});

applyLanguage();

});
