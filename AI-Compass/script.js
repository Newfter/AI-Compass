const translations = {
en: {
navHome: "Home",
navLessons: "Lessons",
navAbout: "About",
heroTitle: 'Navigate the World of <span>AI</span>',
heroSubtitle: "Your guide to understanding Artificial Intelligence.",
heroButton: "Explore Lessons",
lessonsTitle: "Explore the Basics",
lesson1Title: "What is AI?",
lesson1Text: "Discover what Artificial Intelligence is and how it works.",
lesson2Title: "Machine Learning",
lesson2Text: "Learn how machines learn from data and improve.",
lesson3Title: "AI in Everyday Life",
lesson3Text: "See how AI is already part of your daily life.",
lesson4Title: "AI Ethics",
lesson4Text: "Explore the challenges and responsibilities of AI.",
aboutTitle: "About AI Compass",
aboutText: "AI Compass is your starting point for exploring the world of Artificial Intelligence.",
footerText: "Made for curious minds."
},
ru: {
    navHome: "Главная",
    navLessons: "Уроки",
    navAbout: "О проекте",
    heroTitle: 'Исследуй мир <span>ИИ</span>',
    heroSubtitle: "Твой путеводитель по миру искусственного интеллекта.",
    heroButton: "Изучить уроки",
    lessonsTitle: "Изучаем основы",
    lesson1Title: "Что такое ИИ?",
    lesson1Text: "Узнай, что такое искусственный интеллект и как он работает.",
    lesson2Title: "Машинное обучение",
    lesson2Text: "Узнай, как машины учатся на данных и совершенствуются.",
    lesson3Title: "ИИ в повседневной жизни",
    lesson3Text: "Посмотри, как искусственный интеллект уже стал частью нашей жизни.",
    lesson4Title: "Этика ИИ",
    lesson4Text: "Изучи проблемы и ответственность, связанные с ИИ.",
    aboutTitle: "Об AI Compass",
    aboutText: "AI Compass — твоя отправная точка для изучения мира искусственного интеллекта.",
    footerText: "Создано для любознательных умов."
}
};

document.addEventListener("DOMContentLoaded", function () {
const languageButton = document.getElementById("language-toggle");

if (!languageButton) {
    console.error('Button #language-toggle was not found.');
    return;
}

let currentLanguage = "en";

languageButton.addEventListener("click", function () {
    currentLanguage = currentLanguage === "en" ? "ru" : "en";

    document.documentElement.lang = currentLanguage;

    document.querySelectorAll("[data-i18n]").forEach(function (element) {
        const key = element.getAttribute("data-i18n");
        const translation = translations[currentLanguage][key];

        if (translation !== undefined) {
            element.innerHTML = translation;
        }
    });

    languageButton.textContent = currentLanguage === "en" ? "RU" : "EN";

    console.log("Language changed to:", currentLanguage);
});

});
