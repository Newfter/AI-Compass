/* =========================================================
   AI COMPASS — TEXTS: INVITES (challenge a friend)
   Every word in English and in Russian (informal "ты").
   The texts a learner sends with a result, and the small card a
   friend sees when the link is opened.
   Used by js/invite.js.
   To change a text, change it here (in both languages).
   ========================================================= */

window.AICompass.addTranslations({
    en: {
        // A score in a sentence: "8 of 10"
        "invite.score": "{score} of {total}",

        // The card a friend sees after opening a shared link
        "invite.quiz.banner": "A friend got {score} of {total} in the AI Challenge. Can you beat that?",
        "invite.quiz.go": "Take the quiz",
        "invite.exam.banner": "A friend passed the AI Compass qualifying exam with {score} of {total}. Start your own path to it.",
        "invite.exam.go": "Start my path",
        "invite.cert.banner": "A friend earned an AI Compass certificate: “{name}”. Earn yours, lesson by lesson.",
        "invite.cert.go": "Open the lessons",
        "invite.label": "A challenge from a friend",
        "invite.close": "Close",

        // After the friend's quiz: who did better
        "invite.quiz.won": "You beat your friend: {mine} against {theirs}. Send the challenge back!",
        "invite.quiz.tied": "A tie with your friend: {mine} against {theirs}. One more round?",
        "invite.quiz.lost": "Your friend is still ahead: {theirs} against your {mine}. Try again?",

        // What is sent (the link is added after it)
        "invite.exam.text": "🧭 AI Compass · Qualifying exam\nI passed with {score} of {total}.\nCan you?",
        "invite.exam.textHonours": "🧭 AI Compass · Qualifying exam\nI passed with honours: {score} of {total}.\nCan you?",
        "invite.cert.text": "🧭 AI Compass\nI earned the certificate “{name}”.\nCan you earn yours?",

        // Buttons
        "invite.challenge": "Challenge a friend",
        "invite.shareCert": "Share"
    },
    ru: {
        "invite.score": "{score} из {total}",

        "invite.quiz.banner": "Друг набрал {score} из {total} в ИИ-испытании. Сможешь лучше?",
        "invite.quiz.go": "Пройти тест",
        "invite.exam.banner": "Друг сдал квалификационный экзамен AI Compass: {score} из {total}. Начни свой путь к нему.",
        "invite.exam.go": "Начать мой путь",
        "invite.cert.banner": "Друг получил сертификат AI Compass: «{name}». Получи свой, урок за уроком.",
        "invite.cert.go": "Открыть уроки",
        "invite.label": "Вызов от друга",
        "invite.close": "Закрыть",

        "invite.quiz.won": "Победа над другом: {mine} против {theirs}. Отправь вызов обратно!",
        "invite.quiz.tied": "Ничья с другом: {mine} против {theirs}. Ещё раунд?",
        "invite.quiz.lost": "Друг пока впереди: {theirs} против твоих {mine}. Попробуешь ещё раз?",

        "invite.exam.text": "🧭 AI Compass · Квалификационный экзамен\nМой результат: {score} из {total}, экзамен сдан.\nА ты сдашь?",
        "invite.exam.textHonours": "🧭 AI Compass · Квалификационный экзамен\nМой результат: {score} из {total}, сдано с отличием.\nА ты сдашь?",
        "invite.cert.text": "🧭 AI Compass\nУ меня сертификат «{name}».\nПолучишь свой?",

        "invite.challenge": "Бросить вызов другу",
        "invite.shareCert": "Поделиться"
    }
});
