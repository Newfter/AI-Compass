/* =========================================================
   AI COMPASS — THE PAGES SEARCH ENGINES CAN READ
   The site itself is one page (index.html) that draws everything
   with JavaScript. Search engines read that badly, so this script
   writes plain pages from the same texts the site uses, in English
   and in Russian (the Russian ones are in ru/):

     lessons/     one page per lesson                (15)
     glossary/    one page per glossary word         (76)
     teachers/    one lesson plan per lesson         (15)
     path/        the learning path and one page per step of its
                  guided courses                     (48)
     lab/         the experiments of the AI Lab      (1 page)
     history/     the history of AI                  (1 page)
     quiz/        quiz questions with answers        (1 page)
     privacy.html what the site keeps about a person, and why
                  (ru/privacy.html in Russian; the text is js/content/privacy.js)
     go/          the tiny pages a shared result opens first
                  (quiz, exam, certificate: see js/invite.js)
     sitemap.xml  the list of all pages, for search engines

   Run it after a text of the site changes:

       node tools/build-pages.js

   Nothing here is written by hand: change the texts in js/content/
   and run the script again. The pages' look is css/pages.css, their
   few buttons (answer a question, share, print) are js/pages.js.
   Every page also loads js/config.js and js/count.js, which counts
   visits without personal data (see privacy.html).

   Sections of this file:
    1. Read the site's own texts
    2. The words of the pages themselves
    3. The lessons, the words, the path
    4. One page (the frame around every page) and its small parts
    5. Lessons            6. Glossary          7. Teachers
    8. The learning path  9. Lab, history, quiz, privacy
   10. The pages a shared result opens first
   11. The sitemap
   ========================================================= */
"use strict";

const fs = require("fs");
const path = require("path");
const vm = require("vm");

const ROOT = path.join(__dirname, "..");
const SITE = "https://newfter.github.io/AI-Compass/";
const LANGS = ["en", "ru"];
const TRACKS = [
    { id: "basics", icon: "🌱", from: 1, to: 6 },
    { id: "deep", icon: "🤿", from: 7, to: 12 },
    { id: "world", icon: "🌍", from: 13, to: 15 }
];
// The sections of the plain pages, in the order of the menu at the bottom of every page
const SECTIONS = ["lessons", "path", "glossary", "lab", "quiz", "history", "teachers"];
// The ones in the short menu at the top
const TOP = ["lessons", "path", "glossary", "teachers"];
// The stages whose tasks are the questions of the qualifying exam: their pages show the
// tasks without the solutions
const EXAM_STAGES = ["research", "theory"];

/* ---------- 1. Read the site's own texts ---------- */

const texts = { en: {}, ru: {} };
const content = {};
const isObject = (value) => Boolean(value) && typeof value === "object" && !Array.isArray(value);
// A stand-in for the site's "AICompass" object: it only collects the texts
const anything = new Proxy(function () {}, { get: () => anything, apply: () => anything });
const A = new Proxy({
    addTranslations(all) { LANGS.forEach((lang) => Object.assign(texts[lang], all[lang] || {})); },
    content: {
        // (like the site: a second set() of an object adds to the first, e.g. the three files of lesson plans)
        set(name, data) { content[name] = isObject(content[name]) && isObject(data) ? Object.assign(content[name], data) : data; },
        get(name) { return content[name]; }
    }
}, { get: (target, key) => (key in target ? target[key] : anything) });

["lessons.js", "lessons-deep.js", "lessons-world.js", "glossary.js", "glossary-terms.js",
    "teachers-basics.js", "teachers-deep.js", "teachers-world.js", "quiz.js", "quiz-bank.js",
    "timeline.js", "lab.js", "learn.js", "courses/zero.js", "courses/skills.js", "courses/pro.js",
    "courses/build.js", "courses/research.js", "courses/theory.js", "privacy.js"].forEach((file) => {
    const code = fs.readFileSync(path.join(ROOT, "js/content", file), "utf8");
    vm.runInNewContext(code, { window: { AICompass: A }, AICompass: A }, { filename: file });
});

const t = (lang, key) => texts[lang][key];
const esc = (text) => String(text).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
const plain = (html) => String(html).replace(/<[^>]+>/g, "").replace(/\s+/g, " ").trim();
// The texts of the guided courses mark **bold** and `code` (like rich() in js/learn-play.js)
const rich = (text) => esc(text).replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>").replace(/`(.+?)`/g, "<code>$1</code>");
const unmarked = (text) => String(text).replace(/\*\*(.+?)\*\*/g, "$1").replace(/`(.+?)`/g, "$1");
const list = (value) => (Array.isArray(value) ? value : (value === undefined || value === null || value === "" ? [] : [value]));
// "Neural Networks" + "simple explanation" -> "Neural Networks: simple explanation";
// after a title that ends in "?" or "!" the second part starts a new sentence
const joinTitle = (name, rest) => (/[?!]$/.test(name) ? name + " " + rest.charAt(0).toUpperCase() + rest.slice(1) : name + ": " + rest);
const slug = (text) => plain(text).toLowerCase().replace(/&[a-z]+;/g, " ").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

/* ---------- 2. The words of the pages themselves ---------- */

const W = {
    en: {
        site: "AI Compass", tagline: "Learn how AI works, free and without sign-up.",
        lessons: "Lessons", glossary: "AI words", teachers: "For teachers", path: "Learning path",
        lab: "AI Lab", history: "History of AI", quiz: "Quiz", home: "Home",
        other: "Русский", made: "A free student project. No ads, no sign-up.", ctaAll: "Open AI Compass",
        share: "Share", copied: "Link copied", print: "Print", answer: "Show the answer", right: "Right answer", quotes: ["“", "”"],

        lessonsTitle: "AI lessons for beginners: short, free, step by step",
        lessonsDesc: "15 short lessons about artificial intelligence in plain words: what AI is, how machines learn, neural networks, chatbots, fairness and safety. Free, no sign-up.",
        lessonsLead: "Fifteen short lessons in plain words. Read one here, then open it in the app to try its mini-lab and check yourself.",
        lessonTitle: (n) => joinTitle(n, "simple explanation for beginners"),
        lesson: "Lesson", minutes: "min read", keys: "Key points", check: "Check yourself", fact: "Did you know?",
        next: "Next lesson", prev: "Previous lesson", words: "Words in this lesson",
        planLink: "For teachers: a ready plan for this lesson",
        ctaLesson: "Do this lesson in the app", ctaLessonText: "Try the mini-lab, take the quiz and keep your progress. Free, no sign-up.",

        glossaryTitle: "AI glossary: artificial intelligence words in simple language",
        glossaryDesc: "Every important AI word explained in one plain sentence, with an everyday example: neural network, machine learning, token, bias and more.",
        glossaryLead: "Every important AI word in one plain sentence, with an everyday example.",
        termTitle: (n) => joinTitle(n, "simple definition and example"),
        example: "Example", simple: "In simple words", related: "Related words", taught: "Lessons that teach it",
        ctaTerm: "Open it in the glossary", ctaTermText: "Flashcards, search and all the AI words, free and without sign-up.",

        teachersTitle: "Free AI lesson plans for teachers: 15 ready lessons with worksheets",
        teachersDesc: "Ready lesson plans about artificial intelligence for school: objectives, a warm-up, an activity, discussion questions and an exit ticket for each of 15 lessons. Worksheets and answer keys included. Free, no sign-up.",
        teachersLead: "Fifteen ready lessons about AI. Each plan has objectives, a warm-up, an activity, discussion questions and an exit ticket. The printable worksheet and its answer key are in the teacher kit of the app.",
        planTitle: (n) => `AI lesson plan “${n}”: objectives, activity and worksheet`,
        planH1: (n) => `Lesson plan: ${n}`,
        planDesc: (n) => `A ready lesson plan for teachers on “${n}”: objectives, warm-up, activity, discussion questions and an exit ticket. Free, with a worksheet and an answer key.`,
        plan: "Lesson plan", objectives: "By the end of the lesson, students can", warmup: "Warm-up", reading: "Reading",
        readingLink: "Students read the lesson", activity: "Activity", extension: "For students who finish early",
        discussion: "Discussion questions", exit: "Exit ticket", exitCheck: "Quick check", differentiation: "Easier and harder",
        easier: "Easier", harder: "Harder", nextPlan: "Next plan", prevPlan: "Previous plan",
        kitCta: "Open the teacher kit", kitText: "The printable worksheet, its answer key and a classroom quiz for this lesson are in the teacher kit. Free, no sign-up.",

        pathTitle: (n) => `Learn AI from zero: a free step-by-step path in ${n} stages`,
        pathDesc: (n) => `A free path through artificial intelligence, from “what is a program?” to research-level theory: ${n} stages, short steps with tasks, no sign-up.`,
        pathLead: "From the very first idea to research-level theory. Read any step here. In the app the path adapts to your level, gives you a plan for the day and helps you remember.",
        unitTitle: (n) => joinTitle(n, "step by step, with tasks"),
        step: "Step", of: "of", min: "min", task: "Task", solve: "Solve it in the app.", solution: "Show the solution",
        think: "Think first", remember: "Remember", nextStep: "Next step", prevStep: "Previous step",
        ctaUnit: "Do this step in the app", ctaUnitText: "Tasks with hints, a memory check that brings the idea back before you forget it, and your progress. Free, no sign-up.",
        ctaPath: "Start my path",

        labTitle: (n) => `AI Lab: ${n} free machine learning experiments in your browser`,
        labDesc: "Teach a computer your own drawings, train a spam filter, find groups in data: interactive AI experiments that run in your browser. Free, no sign-up, nothing to install.",
        labLead: "Real machine learning that runs in your browser. Pick an experiment, teach a model, test it and see where it fails.",
        shows: "What it shows", ctaLab: "Open the AI Lab", ctaLabText: "Every experiment runs in your browser. Free, no sign-up, nothing to install.",

        historyTitle: "History of AI: a timeline from 1950 to today",
        historyDesc: (n) => `${n} milestones in the history of artificial intelligence, from Turing's question in 1950 to today's chatbots, each explained in plain words with why it matters.`,
        why: "Why it matters", ctaHistory: "Open the timeline", ctaHistoryText: "The interactive timeline, with filters by era and theme. Free, no sign-up.",

        quizTitle: (n) => `AI quiz with answers: ${n} questions for beginners`,
        quizDesc: (n, all) => `Test what you know about artificial intelligence: ${n} questions with answers and explanations, from “what is AI?” to neural networks and AI safety. The full quiz in the app has ${all} questions.`,
        quizLead: "Choose an answer to see whether it is right and why. Two questions for each lesson.",
        ctaQuiz: "Play the full quiz", ctaQuizText: (all) => `${all} questions, a daily challenge and a timed mode. Free, no sign-up.`,

        go: {
            quiz: { hash: "quiz", title: "Can you beat my score in the AI Challenge?", desc: "A quick quiz about artificial intelligence on AI Compass. Free, no sign-up. Take it and see who knows more.", button: "Take the quiz" },
            exam: { hash: "learn", title: "I passed the AI Compass qualifying exam. Can you?", desc: "30 questions on how AI really works, at the end of a free path that starts from zero. No sign-up.", button: "Start my path" },
            certificate: { hash: "lessons", title: "I earned an AI Compass certificate", desc: "Short, free lessons about artificial intelligence, with a certificate at the end. No sign-up. Earn yours.", button: "Open the lessons" }
        }
    },
    ru: {
        site: "AI Compass", tagline: "Узнай, как работает ИИ: бесплатно и без регистрации.",
        lessons: "Уроки", glossary: "Слова об ИИ", teachers: "Учителям", path: "Путь обучения",
        lab: "ИИ-лаборатория", history: "История ИИ", quiz: "Тест", home: "Главная",
        other: "English", made: "Бесплатный школьный проект. Без рекламы и регистрации.", ctaAll: "Открыть AI Compass",
        share: "Поделиться", copied: "Ссылка скопирована", print: "Распечатать", answer: "Показать ответ", right: "Верный ответ", quotes: ["«", "»"],

        lessonsTitle: "Уроки об ИИ для начинающих: коротко, бесплатно, шаг за шагом",
        lessonsDesc: "15 коротких уроков об искусственном интеллекте простыми словами: что такое ИИ, как учатся машины, нейросети, чат-боты, справедливость и безопасность. Бесплатно и без регистрации.",
        lessonsLead: "Пятнадцать коротких уроков простыми словами. Прочитай урок здесь, а потом открой его в приложении: там мини-лаборатория и проверка.",
        lessonTitle: (n) => joinTitle(n, "простое объяснение для начинающих"),
        lesson: "Урок", minutes: "мин чтения", keys: "Главное", check: "Проверь себя", fact: "А ты знал?",
        next: "Следующий урок", prev: "Предыдущий урок", words: "Слова этого урока",
        planLink: "Учителям: готовый план этого урока",
        ctaLesson: "Пройти этот урок в приложении", ctaLessonText: "Мини-лаборатория, тест и сохранение прогресса. Бесплатно и без регистрации.",

        glossaryTitle: "Словарь ИИ: термины искусственного интеллекта простыми словами",
        glossaryDesc: "Каждое важное слово об ИИ в одном простом предложении и с примером из жизни: нейросеть, машинное обучение, токен, предвзятость и другие.",
        glossaryLead: "Каждое важное слово об ИИ в одном простом предложении и с примером из жизни.",
        termTitle: (n) => joinTitle(n, "простое определение и пример"),
        example: "Пример", simple: "Простыми словами", related: "Связанные слова", taught: "Уроки, где это объясняется",
        ctaTerm: "Открыть в словаре", ctaTermText: "Карточки, поиск и все слова об ИИ: бесплатно и без регистрации.",

        teachersTitle: "Бесплатные планы уроков об ИИ для учителей: 15 готовых уроков с рабочими листами",
        teachersDesc: "Готовые планы уроков об искусственном интеллекте для школы: цели, разминка, задание, вопросы для обсуждения и выходной билет для каждого из 15 уроков. С рабочими листами и ответами. Бесплатно и без регистрации.",
        teachersLead: "Пятнадцать готовых уроков об ИИ. В каждом плане есть цели, разминка, задание, вопросы для обсуждения и выходной билет. Рабочий лист для печати и ответы к нему есть в материалах для учителя в приложении.",
        planTitle: (n) => `План урока об ИИ «${n}»: цели, задание и рабочий лист`,
        planH1: (n) => `План урока: ${n}`,
        planDesc: (n) => `Готовый план урока для учителя по теме «${n}»: цели, разминка, задание, вопросы для обсуждения и выходной билет. Бесплатно, с рабочим листом и ответами.`,
        plan: "План урока", objectives: "К концу урока ученики смогут", warmup: "Разминка", reading: "Чтение",
        readingLink: "Ученики читают урок", activity: "Задание", extension: "Тем, кто закончил раньше",
        discussion: "Вопросы для обсуждения", exit: "Выходной билет", exitCheck: "Быстрая проверка", differentiation: "Проще и сложнее",
        easier: "Проще", harder: "Сложнее", nextPlan: "Следующий план", prevPlan: "Предыдущий план",
        kitCta: "Открыть материалы для учителя", kitText: "Рабочий лист для печати, ответы к нему и тест для класса по этому уроку есть в материалах для учителя. Бесплатно и без регистрации.",

        pathTitle: (n) => `Изучить ИИ с нуля: бесплатный путь шаг за шагом, этапов: ${n}`,
        pathDesc: (n) => `Бесплатный путь по искусственному интеллекту: от «что такое программа?» до теории исследовательского уровня. Этапов: ${n}, короткие шаги с заданиями, без регистрации.`,
        pathLead: "От самой первой идеи до теории исследовательского уровня. Любой шаг можно прочитать здесь. В приложении путь подстраивается под твой уровень, даёт план на день и помогает запоминать.",
        unitTitle: (n) => joinTitle(n, "шаг за шагом, с заданиями"),
        step: "Шаг", of: "из", min: "мин", task: "Задание", solve: "Реши его в приложении.", solution: "Показать решение",
        think: "Сначала подумай", remember: "Запомни", nextStep: "Следующий шаг", prevStep: "Предыдущий шаг",
        ctaUnit: "Пройти этот шаг в приложении", ctaUnitText: "Задания с подсказками, проверка памяти, которая возвращает идею до того, как ты её забудешь, и твой прогресс. Бесплатно и без регистрации.",
        ctaPath: "Начать мой путь",

        labTitle: (n) => `ИИ-лаборатория: бесплатные эксперименты с машинным обучением в браузере (${n})`,
        labDesc: "Научи компьютер узнавать твои рисунки, обучи спам-фильтр, найди группы в данных: интерактивные эксперименты с ИИ прямо в браузере. Бесплатно, без регистрации и установки.",
        labLead: "Настоящее машинное обучение прямо в браузере. Выбери эксперимент, обучи модель, проверь её и посмотри, где она ошибается.",
        shows: "Что он показывает", ctaLab: "Открыть ИИ-лабораторию", ctaLabText: "Все эксперименты работают в браузере. Бесплатно, без регистрации и установки.",

        historyTitle: "История ИИ: хронология с 1950 года до наших дней",
        historyDesc: (n) => `История искусственного интеллекта в вехах (${n}): от вопроса Тьюринга в 1950 году до сегодняшних чат-ботов. Каждая объяснена простыми словами: что произошло и почему это важно.`,
        why: "Почему это важно", ctaHistory: "Открыть историю ИИ", ctaHistoryText: "Интерактивная лента с фильтрами по эпохам и темам. Бесплатно и без регистрации.",

        quizTitle: (n) => `Тест по ИИ с ответами для начинающих (вопросов: ${n})`,
        quizDesc: (n, all) => `Проверь, что ты знаешь об искусственном интеллекте: вопросы с ответами и объяснениями (${n}), от «что такое ИИ?» до нейросетей и безопасности ИИ. В полном тесте в приложении вопросов: ${all}.`,
        quizLead: "Выбери ответ, чтобы узнать, верный ли он и почему. По два вопроса к каждому уроку.",
        ctaQuiz: "Пройти полный тест", ctaQuizText: (all) => `Вопросов: ${all}, испытание дня и режим на время. Бесплатно и без регистрации.`,

        go: {
            quiz: { hash: "quiz", title: "Сможешь набрать больше меня в ИИ-испытании?", desc: "Короткий тест об искусственном интеллекте на AI Compass. Бесплатно и без регистрации. Пройди и узнай, кто знает больше.", button: "Пройти тест" },
            exam: { hash: "learn", title: "Мой квалификационный экзамен AI Compass сдан. А ты сдашь?", desc: "30 вопросов о том, как на самом деле работает ИИ, в конце бесплатного пути с нуля. Без регистрации.", button: "Начать мой путь" },
            certificate: { hash: "lessons", title: "У меня сертификат AI Compass", desc: "Короткие бесплатные уроки об искусственном интеллекте с сертификатом в конце. Без регистрации. Получи свой.", button: "Открыть уроки" }
        }
    }
};

/* ---------- 3. The lessons, the words, the path ---------- */

// Which answer of a lesson's own question is right (0, 1 or 2) is in js/lessons.js
const lessonsCode = fs.readFileSync(path.join(ROOT, "js/lessons.js"), "utf8");
const rightOfLesson = {};
lessonsCode.replace(/\bnumber: (\d+), track: [\s\S]*?\bcorrect: (\d+)/g, (all, number, correct) => { rightOfLesson[number] = Number(correct); return all; });

const lessons = [];
for (let n = 1; t("en", `lessons.l${n}.title`); n++) {
    const track = TRACKS.find((item) => n >= item.from && n <= item.to) || TRACKS[TRACKS.length - 1];
    lessons.push({ n, track, slug: slug(t("en", `lessons.l${n}.title`)) });
}
const lessonName = (lang, lesson) => plain(t(lang, `lessons.l${lesson.n}.title`));
const trackName = (lang, track) => plain(t(lang, `lessons.track.${track.id}.title`) || "");

const glossary = content.glossary;
const terms = glossary.terms;
const termById = Object.fromEntries(terms.map((term) => [term.id, term]));

const plans = content["teachers-plans"] || {};
const quizList = (content.quiz && content.quiz.questions) || [];
const quizByKey = Object.fromEntries(quizList.map((question) => [question.key, question]));

// The path: its stages, and the steps ("units") of the guided courses with their own pages
const learn = content.learn;
const stages = learn.stages.map((stage) => {
    if (!stage.course) return { id: stage.id, icon: stage.icon, track: TRACKS.find((track) => track.id === stage.track), units: [] };
    const steps = (content["course." + stage.course] || {}).units || {};
    const units = learn.courses[stage.course].units.filter((unit) => steps[unit.id]).map((unit) => ({
        id: unit.id, icon: unit.icon, minutes: unit.minutes, steps: steps[unit.id].steps || [],
        slug: unit.id + "-" + slug(unmarked(t("en", "learn.unit." + unit.id)))
    }));
    return { id: stage.id, icon: stage.icon, units };
});
const stageName = (lang, stage) => unmarked(t(lang, "learn.stage." + stage.id) || "");
const unitName = (lang, unit) => unmarked(t(lang, "learn.unit." + unit.id) || "");

/* ---------- 4. One page, and its small parts ---------- */

const written = [];   // { folder, file } of every page, for the sitemap
// folder "" is the top of the site, next to index.html (privacy.html; ru/privacy.html in Russian)
const folderOf = (lang, folder) => (lang === "ru" ? "ru/" : "") + (folder ? folder + "/" : "");
const upOf = (lang, folder) => (folder === "" ? (lang === "ru" ? "../" : "./") : (lang === "ru" ? "../../" : "../"));

// folder: "lessons", "glossary"...; file: "what-is-ai.html" or "index.html"
function address(lang, folder, file) {
    return SITE + folderOf(lang, folder) + (file === "index.html" ? "" : file);
}

// o: { title, desc, h1, body, jsonld, type (of the page, for chat previews) }
function page(lang, folder, file, o) {
    const w = W[lang];
    const up = upOf(lang, folder);
    const otherLang = lang === "ru" ? "en" : "ru";
    const self = address(lang, folder, file);
    const privacyAddress = address(lang, "", "privacy.html");
    const crumbs = [{ name: w.site, url: SITE + "?lang=" + lang }];
    if (folder) crumbs.push({ name: w[folder], url: address(lang, folder, "index.html") });
    if (file !== "index.html") crumbs.push({ name: o.h1, url: self });
    const jsonld = [o.jsonld, {
        "@context": "https://schema.org", "@type": "BreadcrumbList",
        itemListElement: crumbs.map((c, i) => ({ "@type": "ListItem", position: i + 1, name: c.name, item: c.url }))
    }].filter(Boolean);
    const menu = (ids) => ids.map((id) => `<a href="${up}${folderOf(lang, id)}">${w[id]}</a>`).join("\n        ");
    const html = `<!DOCTYPE html>
<html lang="${lang}">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<!-- Written by tools/build-pages.js from the texts in js/content/. Do not edit by hand. -->
<title>${esc(o.title)} | AI Compass</title>
<meta name="description" content="${esc(o.desc)}">
<link rel="canonical" href="${self}">
<link rel="alternate" hreflang="en" href="${address("en", folder, file)}">
<link rel="alternate" hreflang="ru" href="${address("ru", folder, file)}">
<link rel="alternate" hreflang="x-default" href="${address("en", folder, file)}">
<meta property="og:type" content="${o.type || "article"}">
<meta property="og:site_name" content="AI Compass">
<meta property="og:title" content="${esc(o.title)}">
<meta property="og:description" content="${esc(o.desc)}">
<meta property="og:url" content="${self}">
<meta property="og:locale" content="${lang === "ru" ? "ru_RU" : "en_US"}">
<meta property="og:image" content="${SITE}images/og-image.png">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta name="twitter:card" content="summary_large_image">
<meta name="theme-color" content="#050b14">
<link rel="icon" href="${up}images/favicon-32.png" sizes="32x32" type="image/png">
<link rel="stylesheet" href="${up}css/pages.css">
<script src="${up}js/pages.js" defer></script>
<script src="${up}js/config.js" defer></script>
<script src="${up}js/count.js" defer></script>
${jsonld.map((item) => `<script type="application/ld+json">${JSON.stringify(item).replace(/</g, "\\u003c")}</script>`).join("\n")}
</head>
<body>
<header class="pg-top">
    <a class="pg-logo" href="${up}index.html?lang=${lang}">🧭 AI <span>Compass</span></a>
    <nav aria-label="${esc(w.site)}">
        ${menu(TOP)}
        <a href="${address(otherLang, folder, file)}" hreflang="${otherLang}" lang="${otherLang}">${w.other}</a>
    </nav>
</header>
<main class="pg-main">
<p class="pg-crumbs">${crumbs.filter((c) => c.url !== self).map((c) => `<a href="${c.url}">${esc(c.name)}</a>`).join(" › ")}</p>
${o.body}
</main>
<footer class="pg-foot">
    <nav class="pg-more" aria-label="${esc(w.site)}">
        ${menu(SECTIONS)}
    </nav>
    <p>${w.made}${self === privacyAddress ? "" : ` <a href="${up}${folderOf(lang, "")}privacy.html">${content.privacy[lang].link}</a>`}</p>
    <p><a class="pg-btn" href="${up}index.html?lang=${lang}">${w.ctaAll}</a></p>
</footer>
</body>
</html>
`;
    const target = path.join(ROOT, folderOf(lang, folder), file);
    fs.mkdirSync(path.dirname(target), { recursive: true });
    fs.writeFileSync(target, html);
    written.push({ folder, file });
    return self;
}

// The box at the end of a page: one sentence and the button into the app
function cta(lang, hash, title, text) {
    return `<aside class="pg-cta"><p>${text}</p><a class="pg-btn" href="${upOf(lang)}index.html?lang=${lang}#${hash}">${title} →</a></aside>`;
}

// "Share" (and "Print" on the lesson plans): js/pages.js shows the buttons where they work
function tools(lang, withPrint) {
    const w = W[lang];
    return `<p class="pg-tools"><button type="button" class="pg-chip" data-share data-done="${esc(w.copied)}" hidden>🔗 ${w.share}</button>` +
        (withPrint ? `<button type="button" class="pg-chip" data-print hidden>🖨️ ${w.print}</button>` : "") + "</p>";
}

// A question with answers to click (js/pages.js marks the answer; without scripts, "Show the
// answer" opens it). options: HTML texts, the right one first; "turn" moves the right one
// to another place, the same on every run.
function question(lang, text, options, turn, why, headingTag) {
    const w = W[lang];
    const count = options.length;
    const place = ((turn % count) + count) % count;
    const shown = options.map((_, i) => options[(i - place + count) % count]);
    return `<div class="pg-quiz">
<${headingTag || "p"} class="pg-q">${text}</${headingTag || "p"}>
<ol type="A" class="pg-options">${shown.map((option, i) => `<li><button type="button"${i === place ? " data-right" : ""}>${option}</button></li>`).join("")}</ol>
<details class="pg-why"><summary>${w.answer}</summary><p><strong>${w.right}: ${options[0]}</strong></p>${why ? `<p>${why}</p>` : ""}</details>
</div>`;
}

const pager = (prev, next, label) => `<nav class="pg-pager" aria-label="${label}">${prev || "<span></span>"}${next || "<span></span>"}</nav>`;
const pagerLink = (file, label, name) => `<a href="${file}"><small>${label}</small>${name}</a>`;

/* ---------- 5. The lesson pages ---------- */

function lessonPage(lang, lesson) {
    const w = W[lang];
    const k = (name) => t(lang, `lessons.l${lesson.n}.${name}`);
    const title = lessonName(lang, lesson);
    let words = 0;
    let body = "";
    for (let s = 1; k(`s${s}.h`); s++) {
        body += `<h2>${k(`s${s}.h`)}</h2>\n<p>${k(`s${s}.p`)}</p>\n`;
        if (k(`s${s}.note`)) body += `<p class="pg-note"><strong>${w.fact}</strong> ${k(`s${s}.note`)}</p>\n`;
        words += plain(k(`s${s}.p`)).split(" ").length;
    }
    let keys = "";
    for (let i = 1; k(`key${i}`); i++) keys += `<li>${k(`key${i}`)}</li>`;
    // The lesson's own question: its answers stay in their order, the right one is marked
    const answers = [];
    for (let i = 1; k(`a${i}`); i++) answers.push(k(`a${i}`));
    const right = rightOfLesson[lesson.n];
    const check = k("q") && answers[right] !== undefined
        ? `<section class="pg-check"><h2>${w.check}</h2>` +
            question(lang, k("q"), [answers[right]].concat(answers.filter((_, i) => i !== right)), right, k("explain")) + "</section>"
        : "";
    const taught = terms.filter((term) => (term.lessons || []).indexOf(lesson.n) !== -1)
        .map((term) => `<a href="../glossary/${term.id}.html">${esc(term[lang].name)}</a>`).join("");
    const prev = lessons[lesson.n - 2];
    const next = lessons[lesson.n];
    const file = lesson.slug + ".html";
    page(lang, "lessons", file, {
        title: w.lessonTitle(title),
        desc: plain(k("desc")) + " " + plain(k("key1") || ""),
        h1: title,
        jsonld: {
            "@context": "https://schema.org", "@type": "LearningResource", name: title, headline: title,
            description: plain(k("desc")), inLanguage: lang, isAccessibleForFree: true,
            learningResourceType: "lesson", educationalLevel: "beginner",
            url: address(lang, "lessons", file), image: SITE + "images/og-image.png",
            publisher: { "@type": "Organization", name: "AI Compass", url: SITE }
        },
        body: `<article>
<p class="pg-kicker">${lesson.track.icon} ${trackName(lang, lesson.track)} · ${w.lesson} ${lesson.n} · ${Math.max(2, Math.round(words / 180))} ${w.minutes}</p>
<h1>${k("title")}</h1>
<p class="pg-lead">${k("desc")}</p>
${tools(lang)}
${body}<section class="pg-keys"><h2>${w.keys}</h2><ul>${keys}</ul></section>
${check}
${taught ? `<h2>${w.words}</h2><p class="pg-tags">${taught}</p>` : ""}
${cta(lang, "lesson-" + lesson.n, w.ctaLesson, w.ctaLessonText)}
${plans[lesson.n] ? `<p class="pg-aside">🍎 <a href="../teachers/${file}">${w.planLink}</a></p>` : ""}
${pager(prev && pagerLink(prev.slug + ".html", w.prev, lessonName(lang, prev)), next && pagerLink(next.slug + ".html", w.next, lessonName(lang, next)), w.lessons)}
</article>`
    });
}

// The list of the lessons, by track; "to" makes the address and the second line of an entry
function lessonGroups(lang, to) {
    return TRACKS.map((track) => {
        const items = lessons.filter((lesson) => lesson.track === track).map((lesson) => to(lesson)).filter(Boolean).join("\n");
        return items ? `<h2>${track.icon} ${trackName(lang, track)}</h2>\n<ol class="pg-list" start="${track.from}">${items}</ol>` : "";
    }).join("\n");
}

function lessonsIndex(lang) {
    const w = W[lang];
    const groups = lessonGroups(lang, (lesson) =>
        `<li><a href="${lesson.slug}.html">${lessonName(lang, lesson)}</a><span>${plain(t(lang, `lessons.l${lesson.n}.desc`))}</span></li>`);
    page(lang, "lessons", "index.html", {
        title: w.lessonsTitle, desc: w.lessonsDesc, h1: w.lessons, type: "website",
        jsonld: {
            "@context": "https://schema.org", "@type": "Course", name: w.lessonsTitle, description: w.lessonsDesc,
            inLanguage: lang, isAccessibleForFree: true, provider: { "@type": "Organization", name: "AI Compass", url: SITE }
        },
        body: `<h1>${w.lessonsTitle}</h1>\n<p class="pg-lead">${w.lessonsLead}</p>\n${groups}\n${cta(lang, "lessons", w.ctaAll, w.tagline)}`
    });
}

/* ---------- 6. The glossary pages ---------- */

function termPage(lang, term) {
    const w = W[lang];
    const text = term[lang];
    const related = (term.related || []).map((id) => termById[id]).filter(Boolean).map((other) =>
        `<li><a href="${other.id}.html">${esc(other[lang].name)}</a><span>${esc(other[lang].short)}</span></li>`).join("\n");
    const taught = (term.lessons || []).map((n) => lessons[n - 1]).filter(Boolean).map((lesson) =>
        `<li><a href="../lessons/${lesson.slug}.html">${w.lesson} ${lesson.n}: ${lessonName(lang, lesson)}</a></li>`).join("");
    const file = term.id + ".html";
    page(lang, "glossary", file, {
        title: w.termTitle(text.name),
        desc: text.short + " " + text.ex,
        h1: text.name,
        jsonld: {
            "@context": "https://schema.org", "@type": "DefinedTerm", name: text.name, description: text.def,
            inLanguage: lang, url: address(lang, "glossary", file),
            inDefinedTermSet: { "@type": "DefinedTermSet", name: w.glossaryTitle, url: address(lang, "glossary", "index.html") }
        },
        body: `<article>
<p class="pg-kicker">${term.icon} ${esc(t(lang, "glossary.cat." + term.cat) || "")}</p>
<h1>${esc(text.name)}</h1>
<h2>${w.simple}</h2>
<p class="pg-lead">${esc(text.short)}</p>
<p>${esc(text.def)}</p>
<p class="pg-note"><strong>${w.example}.</strong> ${esc(text.ex)}</p>
${taught ? `<h2>${w.taught}</h2><ul>${taught}</ul>` : ""}
${related ? `<h2>${w.related}</h2><ul class="pg-list">${related}</ul>` : ""}
${cta(lang, "term-" + term.id, w.ctaTerm, w.ctaTermText)}
</article>`
    });
}

function glossaryIndex(lang) {
    const w = W[lang];
    const groups = glossary.categories.map((cat) => {
        const items = terms.filter((term) => term.cat === cat).map((term) =>
            `<li><a href="${term.id}.html">${esc(term[lang].name)}</a><span>${esc(term[lang].short)}</span></li>`).join("\n");
        return `<h2>${esc(t(lang, "glossary.cat." + cat) || cat)}</h2>\n<ul class="pg-list">${items}</ul>`;
    }).join("\n");
    page(lang, "glossary", "index.html", {
        title: w.glossaryTitle, desc: w.glossaryDesc, h1: w.glossary, type: "website",
        jsonld: { "@context": "https://schema.org", "@type": "DefinedTermSet", name: w.glossaryTitle, description: w.glossaryDesc, inLanguage: lang },
        body: `<h1>${w.glossaryTitle}</h1>\n<p class="pg-lead">${w.glossaryLead}</p>\n${groups}\n${cta(lang, "glossary", w.ctaAll, w.tagline)}`
    });
}

/* ---------- 7. The pages for teachers: one lesson plan per lesson ---------- */

// The question of the quiz bank that a plan names for its exit ticket, with its answer
function exitQuestion(lang, key) {
    const info = quizByKey[key];
    const text = t(lang, `quiz.${key}.text`);
    if (!info || !text) return "";
    const answer = info.type === "truefalse" ? t(lang, info.correct === 0 ? "quiz.true" : "quiz.false") : t(lang, `quiz.${key}.o1`);
    return `<p class="pg-note"><strong>${W[lang].exitCheck}.</strong> ${text}<br><strong>${W[lang].right}:</strong> ${answer || ""}</p>`;
}

function planPage(lang, lesson) {
    const w = W[lang];
    const plan = plans[lesson.n] && plans[lesson.n][lang];
    if (!plan) return;
    const name = lessonName(lang, lesson);
    const file = lesson.slug + ".html";
    const items = (values, tag) => `<${tag}>${list(values).map((value) => `<li>${esc(value)}</li>`).join("")}</${tag}>`;
    const withPlan = lessons.filter((other) => plans[other.n] && plans[other.n][lang]);
    const at = withPlan.indexOf(lesson);
    const prev = withPlan[at - 1];
    const next = withPlan[at + 1];
    page(lang, "teachers", file, {
        title: w.planTitle(name), desc: w.planDesc(name), h1: w.planH1(name),
        jsonld: {
            "@context": "https://schema.org", "@type": "LearningResource", name: w.planH1(name), description: w.planDesc(name),
            inLanguage: lang, isAccessibleForFree: true, learningResourceType: "lesson plan",
            audience: { "@type": "EducationalAudience", educationalRole: "teacher" },
            about: { "@type": "Thing", name: "Artificial intelligence" },
            url: address(lang, "teachers", file), publisher: { "@type": "Organization", name: "AI Compass", url: SITE }
        },
        body: `<article>
<p class="pg-kicker">🍎 ${w.plan} · ${lesson.track.icon} ${trackName(lang, lesson.track)} · ${w.lesson} ${lesson.n}</p>
<h1>${esc(w.planH1(name))}</h1>
<p class="pg-lead">${plain(t(lang, `lessons.l${lesson.n}.desc`))}</p>
${tools(lang, true)}
<h2>${w.objectives}</h2>
${items(plan.objectives, "ul")}
<h2>${w.warmup}</h2>
<p>${esc(plan.warmup || "")}</p>
${plan.warmupNote ? `<p class="pg-note">${esc(plan.warmupNote)}</p>` : ""}
<h2>${w.reading}</h2>
<p>${w.readingLink} ${w.quotes[0]}<a href="../lessons/${file}">${name}</a>${w.quotes[1]}. ${esc(plan.reading || "")}</p>
${plan.activity ? `<h2>${w.activity}: ${esc(plan.activity.title || "")}</h2>\n${items(plan.activity.steps, "ol")}` : ""}
${plan.extension ? `<h2>${w.extension}</h2>\n<p>${esc(plan.extension)}</p>` : ""}
<h2>${w.discussion}</h2>
${items(plan.discussion, "ul")}
<h2>${w.exit}</h2>
<p>${esc(plan.exit || "")}</p>
${exitQuestion(lang, plans[lesson.n].exit)}
${plan.easier || plan.harder ? `<h2>${w.differentiation}</h2>
${plan.easier ? `<p><strong>${w.easier}.</strong> ${esc(plan.easier)}</p>` : ""}
${plan.harder ? `<p><strong>${w.harder}.</strong> ${esc(plan.harder)}</p>` : ""}` : ""}
${cta(lang, "teachers", w.kitCta, w.kitText)}
${pager(prev && pagerLink(prev.slug + ".html", w.prevPlan, lessonName(lang, prev)), next && pagerLink(next.slug + ".html", w.nextPlan, lessonName(lang, next)), w.teachers)}
</article>`
    });
}

function teachersIndex(lang) {
    const w = W[lang];
    const groups = lessonGroups(lang, (lesson) => (plans[lesson.n] && plans[lesson.n][lang]
        ? `<li><a href="${lesson.slug}.html">${esc(w.planH1(lessonName(lang, lesson)))}</a><span>${esc(list(plans[lesson.n][lang].objectives).join(" "))}</span></li>`
        : ""));
    page(lang, "teachers", "index.html", {
        title: w.teachersTitle, desc: w.teachersDesc, h1: w.teachers, type: "website",
        jsonld: {
            "@context": "https://schema.org", "@type": "Course", name: w.teachersTitle, description: w.teachersDesc, inLanguage: lang,
            isAccessibleForFree: true, audience: { "@type": "EducationalAudience", educationalRole: "teacher" },
            provider: { "@type": "Organization", name: "AI Compass", url: SITE }
        },
        body: `<h1>${w.teachersTitle}</h1>\n<p class="pg-lead">${w.teachersLead}</p>\n${groups}\n${cta(lang, "teachers", w.kitCta, w.kitText)}`
    });
}

/* ---------- 8. The learning path: the stages, and one page per step of a guided course ---------- */

// One screen of a step (see the top of js/content/courses/zero.js for the kinds)
function screenHTML(lang, step, turn, withSolutions) {
    const w = W[lang];
    const d = step[lang] || {};
    const paragraphs = (value) => list(value).map((line) => `<p>${rich(line)}</p>`).join("\n");
    if (step.type === "info") {
        const table = d.table && Array.isArray(d.table.rows)
            ? `<div class="pg-table"><table>${d.table.head ? `<thead><tr>${d.table.head.map((cell) => `<th>${rich(cell)}</th>`).join("")}</tr></thead>` : ""}` +
                `<tbody>${d.table.rows.map((row) => `<tr>${list(row).map((cell) => `<td>${rich(cell)}</td>`).join("")}</tr>`).join("")}</tbody></table></div>`
            : "";
        return `<h2>${step.icon ? step.icon + " " : ""}${rich(d.title || "")}</h2>\n${paragraphs(d.text)}\n` +
            (list(d.example).length ? `<div class="pg-example${step.mono ? " is-mono" : ""}">${list(d.example).map((line) => `<div>${rich(line)}</div>`).join("")}</div>\n` : "") +
            table + (d.note ? `<p class="pg-note">${rich(d.note)}</p>\n` : "");
    }
    if (step.type === "recap") {
        return `<section class="pg-keys"><h2>${w.remember}</h2><ul>${list(d.points).map((point) => `<li>${rich(point)}</li>`).join("")}</ul></section>\n`;
    }
    if (!d.q) return "";
    if (step.type === "reveal") {
        return `<section class="pg-check"><p><strong>${w.think}.</strong> ${rich(d.q)}</p><details><summary>${w.answer}</summary>${paragraphs(d.answer)}</details></section>\n`;
    }
    if (!withSolutions) {
        return `<section class="pg-check"><p><strong>${w.task}.</strong> ${rich(d.q)}</p><p class="pg-soft">${w.solve}</p></section>\n`;
    }
    if (step.type === "choice" && list(d.options).length > 1) {
        return `<section class="pg-check">${question(lang, `<strong>${w.task}.</strong> ${rich(d.q)}`, d.options.map(rich), turn, d.why ? rich(d.why) : "")}</section>\n`;
    }
    // The other tasks (a number, an order, groups, pairs): the question, and the explanation to open
    const order = step.type === "order" && list(d.items).length ? `<ol>${d.items.map((item) => `<li>${rich(item)}</li>`).join("")}</ol>` : "";
    const solution = order || d.why ? `<details><summary>${w.solution}</summary>${order}${d.why ? `<p>${rich(d.why)}</p>` : ""}</details>` : `<p class="pg-soft">${w.solve}</p>`;
    return `<section class="pg-check"><p><strong>${w.task}.</strong> ${rich(d.q)}</p>${solution}</section>\n`;
}

function unitPage(lang, stage, unit, index) {
    const w = W[lang];
    const name = unitName(lang, unit);
    const lead = unmarked(t(lang, "learn.unit." + unit.id + ".text") || "");
    const file = unit.slug + ".html";
    const withSolutions = EXAM_STAGES.indexOf(stage.id) === -1;
    const body = unit.steps.map((step, i) => screenHTML(lang, step, i + 1, withSolutions)).join("");
    const prev = stage.units[index - 1];
    const next = stage.units[index + 1];
    page(lang, "path", file, {
        title: w.unitTitle(name), desc: (lead + " " + stageName(lang, stage) + ": " + w.step.toLowerCase() + " " + (index + 1) + " " + w.of + " " + stage.units.length + ".").trim(), h1: name,
        jsonld: {
            "@context": "https://schema.org", "@type": "LearningResource", name: name, headline: name, description: lead,
            inLanguage: lang, isAccessibleForFree: true, learningResourceType: "lesson",
            url: address(lang, "path", file), publisher: { "@type": "Organization", name: "AI Compass", url: SITE }
        },
        body: `<article>
<p class="pg-kicker">${stage.icon} <a href="./#${stage.id}">${esc(stageName(lang, stage))}</a> · ${w.step} ${index + 1} ${w.of} ${stage.units.length}${unit.minutes ? ` · ${unit.minutes} ${w.min}` : ""}</p>
<h1>${esc(name)}</h1>
<p class="pg-lead">${esc(lead)}</p>
${tools(lang)}
${body}
${cta(lang, "learn/" + unit.id, w.ctaUnit, w.ctaUnitText)}
${pager(prev && pagerLink(prev.slug + ".html", w.prevStep, esc(unitName(lang, prev))), next && pagerLink(next.slug + ".html", w.nextStep, esc(unitName(lang, next))), w.path)}
</article>`
    });
}

function pathIndex(lang) {
    const w = W[lang];
    const body = stages.map((stage, i) => {
        const entries = stage.track
            ? lessons.filter((lesson) => lesson.track === stage.track).map((lesson) =>
                `<li><a href="../lessons/${lesson.slug}.html">${lessonName(lang, lesson)}</a><span>${plain(t(lang, `lessons.l${lesson.n}.desc`))}</span></li>`)
            : stage.units.map((unit) =>
                `<li><a href="${unit.slug}.html">${esc(unitName(lang, unit))}</a><span>${esc(unmarked(t(lang, "learn.unit." + unit.id + ".text") || ""))}</span></li>`);
        return `<h2 id="${stage.id}">${stage.icon} ${i + 1}. ${esc(stageName(lang, stage))}</h2>\n` +
            `<p>${esc(unmarked(t(lang, "learn.stage." + stage.id + ".text") || ""))}</p>\n<ol class="pg-list">${entries.join("\n")}</ol>`;
    }).join("\n");
    page(lang, "path", "index.html", {
        title: w.pathTitle(stages.length), desc: w.pathDesc(stages.length), h1: w.path, type: "website",
        jsonld: {
            "@context": "https://schema.org", "@type": "Course", name: w.pathTitle(stages.length), description: w.pathDesc(stages.length),
            inLanguage: lang, isAccessibleForFree: true, provider: { "@type": "Organization", name: "AI Compass", url: SITE }
        },
        body: `<h1>${w.pathTitle(stages.length)}</h1>\n<p class="pg-lead">${w.pathLead}</p>\n${tools(lang)}\n${body}\n${cta(lang, "learn", w.ctaPath, w.ctaUnitText)}`
    });
}

/* ---------- 9. The AI Lab, the history of AI, the quiz: one page each ---------- */

function labPage(lang) {
    const w = W[lang];
    const catalogue = (content["lab.catalogue"] || []).filter((item) => t(lang, item.titleKey));
    const body = catalogue.map((item) =>
        `<h2>${item.emoji || "🧪"} ${plain(t(lang, item.titleKey))}</h2>\n<p>${plain(t(lang, item.hookKey) || "")}</p>\n` +
        (t(lang, item.ideaKey) ? `<p class="pg-soft"><strong>${w.shows}:</strong> ${plain(t(lang, item.ideaKey))}</p>` : "")).join("\n");
    page(lang, "lab", "index.html", {
        title: w.labTitle(catalogue.length), desc: w.labDesc, h1: w.lab, type: "website",
        jsonld: { "@context": "https://schema.org", "@type": "CollectionPage", name: w.labTitle(catalogue.length), description: w.labDesc, inLanguage: lang, isAccessibleForFree: true },
        body: `<h1>${w.labTitle(catalogue.length)}</h1>\n<p class="pg-lead">${w.labLead}</p>\n${tools(lang)}\n${body}\n${cta(lang, "lab", w.ctaLab, w.ctaLabText)}`
    });
}

function historyPage(lang) {
    const w = W[lang];
    const timeline = content.timeline;
    const events = timeline.events.filter((event) => t(lang, `timeline.${event.key}.title`));
    const body = timeline.eras.map((era) => {
        const items = events.filter((event) => event.era === era).map((event) => {
            const k = (name) => t(lang, `timeline.${event.key}.${name}`) || "";
            const links = (event.terms || []).map((id) => termById[id]).filter(Boolean)
                .map((term) => `<a href="../glossary/${term.id}.html">${esc(term[lang].name)}</a>`)
                .concat(lessons[event.lesson - 1] ? [`<a href="../lessons/${lessons[event.lesson - 1].slug}.html">${w.lesson} ${event.lesson}: ${lessonName(lang, lessons[event.lesson - 1])}</a>`] : []);
            return `<h3>${event.icon || ""} ${event.datetime ? `<time datetime="${event.datetime}">${plain(k("year"))}</time>` : plain(k("year"))}: ${plain(k("title"))}</h3>\n<p>${k("text")}</p>\n` +
                (k("why") ? `<p class="pg-note"><strong>${w.why}.</strong> ${k("why")}</p>\n` : "") +
                (links.length ? `<p class="pg-tags">${links.join("")}</p>\n` : "");
        }).join("");
        const name = (part) => plain(t(lang, "timeline.era." + era + (part ? "." + part : "")) || "");
        return `<h2>${name()} (${name("range")})</h2>\n<p class="pg-soft">${name("desc")}</p>\n${items}`;
    }).join("\n");
    const desc = w.historyDesc(events.length);
    page(lang, "history", "index.html", {
        title: w.historyTitle, desc: desc, h1: w.history,
        jsonld: {
            "@context": "https://schema.org", "@type": "Article", headline: w.historyTitle, description: desc, inLanguage: lang,
            isAccessibleForFree: true, image: SITE + "images/og-image.png", publisher: { "@type": "Organization", name: "AI Compass", url: SITE }
        },
        body: `<article><h1>${w.historyTitle}</h1>\n<p class="pg-lead">${plain(t(lang, "timeline.subtitle") || "")}</p>\n${tools(lang)}\n${body}\n${cta(lang, "timeline", w.ctaHistory, w.ctaHistoryText)}</article>`
    });
}

function quizPage(lang) {
    const w = W[lang];
    let count = 0;
    const body = lessons.map((lesson) => {
        const two = quizList.filter((item) => item.lesson === lesson.n && item.type === "choice" && t(lang, `quiz.${item.key}.o2`)).slice(0, 2);
        if (!two.length) return "";
        return `<h2>${w.lesson} ${lesson.n}: <a href="../lessons/${lesson.slug}.html">${lessonName(lang, lesson)}</a></h2>\n` + two.map((item) => {
            const k = (name) => t(lang, `quiz.${item.key}.${name}`);
            const options = [];
            for (let i = 1; k("o" + i); i++) options.push(k("o" + i));
            count++;
            return question(lang, `${count}. ${k("text")}`, options, count, k("explain"), "h3");
        }).join("\n");
    }).join("\n");
    const desc = w.quizDesc(count, quizList.length);
    page(lang, "quiz", "index.html", {
        title: w.quizTitle(count), desc: desc, h1: w.quiz, type: "website",
        jsonld: {
            "@context": "https://schema.org", "@type": "Quiz", name: w.quizTitle(count), description: desc, inLanguage: lang,
            isAccessibleForFree: true, about: { "@type": "Thing", name: "Artificial intelligence" }, educationalLevel: "beginner"
        },
        body: `<h1>${w.quizTitle(count)}</h1>\n<p class="pg-lead">${w.quizLead}</p>\n${tools(lang)}\n${body}\n${cta(lang, "quiz", w.ctaQuiz, w.ctaQuizText(quizList.length))}`
    });
}

/* The privacy page: what the site keeps about a person, and why. It sits next to index.html
   (privacy.html, ru/privacy.html); its text is js/content/privacy.js. */
function privacyPage(lang) {
    const p = content.privacy[lang];
    // a text is a paragraph; a list of texts is a list with dots
    const blocks = (items) => items.map((item) => (Array.isArray(item)
        ? `<ul>${item.map((line) => `<li>${line}</li>`).join("")}</ul>`
        : `<p>${item}</p>`)).join("\n");
    page(lang, "", "privacy.html", {
        title: p.title, desc: p.desc, h1: p.h1, type: "website",
        jsonld: { "@context": "https://schema.org", "@type": "WebPage", name: p.title, description: p.desc, inLanguage: lang },
        body: `<h1>${esc(p.h1)}</h1>\n<p class="pg-lead">${p.lead}</p>\n` +
            `<aside class="pg-keys"><h2>${esc(p.short.title)}</h2>${blocks([p.short.items])}</aside>\n` +
            p.sections.map((section) => `<h2 id="${section.id}">${esc(section.title)}</h2>\n${blocks(section.text)}`).join("\n")
    });
}

LANGS.forEach((lang) => {
    lessonsIndex(lang);
    lessons.forEach((lesson) => lessonPage(lang, lesson));
    glossaryIndex(lang);
    terms.forEach((term) => termPage(lang, term));
    teachersIndex(lang);
    lessons.forEach((lesson) => planPage(lang, lesson));
    pathIndex(lang);
    stages.forEach((stage) => stage.units.forEach((unit, index) => unitPage(lang, stage, unit, index)));
    labPage(lang);
    historyPage(lang);
    quizPage(lang);
    privacyPage(lang);
});

/* ---------- 10. The pages a shared result opens first ----------
   A learner shares ".../go/quiz.html?s=8-10" (js/invite.js). A chat app reads this page's
   title and text for the preview of the link; a person is sent straight on to the site,
   which then shows "A friend got 8 of 10. Can you beat that?".
   (kind: the name in the site's address, ?friend=quiz.8-10) */

const GO = [{ file: "quiz", kind: "quiz" }, { file: "exam", kind: "exam" }, { file: "certificate", kind: "cert" }];

function goPage(lang, item) {
    const w = W[lang];
    const words = w.go[item.file];
    const up = upOf(lang);
    const self = SITE + folderOf(lang, "go") + item.file + ".html";
    const app = `${up}index.html?lang=${lang}`;
    const html = `<!DOCTYPE html>
<html lang="${lang}">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<!-- Written by tools/build-pages.js. Do not edit by hand. -->
<title>${esc(words.title)} | AI Compass</title>
<meta name="description" content="${esc(words.desc)}">
<meta name="robots" content="noindex">
<meta property="og:type" content="website">
<meta property="og:site_name" content="AI Compass">
<meta property="og:title" content="${esc(words.title)}">
<meta property="og:description" content="${esc(words.desc)}">
<meta property="og:url" content="${self}">
<meta property="og:locale" content="${lang === "ru" ? "ru_RU" : "en_US"}">
<meta property="og:image" content="${SITE}images/og-image.png">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta name="twitter:card" content="summary_large_image">
<meta name="theme-color" content="#050b14">
<script>
// Straight on to the site, with the friend's result (?s=8-10) if the link carries one
(function () {
    var result = /[?&]s=([a-z0-9-]{1,20})(&|$)/.exec(window.location.search);
    window.location.replace("${app}" + (result ? "&friend=${item.kind}." + result[1] : "") + "#${words.hash}");
})();
</script>
<link rel="icon" href="${up}images/favicon-32.png" sizes="32x32" type="image/png">
<link rel="stylesheet" href="${up}css/pages.css">
</head>
<body>
<main class="pg-main">
<h1>${esc(words.title)}</h1>
<p class="pg-lead">${esc(words.desc)}</p>
<p><a class="pg-btn" href="${app}#${words.hash}">${words.button} →</a></p>
</main>
</body>
</html>
`;
    const target = path.join(ROOT, folderOf(lang, "go"), item.file + ".html");
    fs.mkdirSync(path.dirname(target), { recursive: true });
    fs.writeFileSync(target, html);
}
LANGS.forEach((lang) => GO.forEach((item) => goPage(lang, item)));

/* ---------- 11. The sitemap ---------- */

const alternates = (en, ru, fallback) =>
    `        <xhtml:link rel="alternate" hreflang="en" href="${en}"/>\n` +
    `        <xhtml:link rel="alternate" hreflang="ru" href="${ru}"/>\n` +
    `        <xhtml:link rel="alternate" hreflang="x-default" href="${fallback}"/>\n`;
let urls = [SITE, SITE + "?lang=en", SITE + "?lang=ru"].map((loc) =>
    `    <url>\n        <loc>${loc}</loc>\n${alternates(SITE + "?lang=en", SITE + "?lang=ru", SITE)}    </url>\n`).join("");
const seen = new Set();
written.forEach((item) => {
    const key = item.folder + "/" + item.file;
    if (seen.has(key)) return;
    seen.add(key);
    const en = address("en", item.folder, item.file);
    const ru = address("ru", item.folder, item.file);
    [en, ru].forEach((loc) => { urls += `    <url>\n        <loc>${loc}</loc>\n${alternates(en, ru, en)}    </url>\n`; });
});
fs.writeFileSync(path.join(ROOT, "sitemap.xml"), `<?xml version="1.0" encoding="UTF-8"?>
<!-- The pages of AI Compass for search engines, written by tools/build-pages.js.
     The app itself is one page in two languages (?lang=en, ?lang=ru); every lesson, glossary
     word, lesson plan and step of the path also has a plain page of its own, in both languages. -->
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xhtml="http://www.w3.org/1999/xhtml">
${urls}</urlset>
`);

const units = stages.reduce((sum, stage) => sum + stage.units.length, 0);
console.log(`Wrote ${seen.size * 2} pages in 2 languages (${lessons.length} lessons, ${terms.length} words, ` +
    `${lessons.filter((lesson) => plans[lesson.n]).length} lesson plans, ${units} steps of the path) and sitemap.xml with ${seen.size * 2 + 3} addresses`);
