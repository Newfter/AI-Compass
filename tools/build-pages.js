/* =========================================================
   AI COMPASS — THE PAGES SEARCH ENGINES CAN READ
   The site itself is one page (index.html) that draws every lesson
   with JavaScript. Search engines read that badly, so this script
   writes one plain page per lesson and per glossary word, in English
   and in Russian, from the same texts the site uses:

     lessons/what-is-ai.html          ru/lessons/what-is-ai.html
     glossary/neural-network.html     ru/glossary/neural-network.html
     lessons/index.html, glossary/index.html (and the Russian ones)
     go/quiz.html, go/exam.html, go/certificate.html (and ru/go/...):
         the tiny pages a shared result opens first (see js/invite.js)
     sitemap.xml (the list of all pages, for search engines)

   Run it after a lesson or a glossary word changes:

       node tools/build-pages.js

   Nothing here is written by hand: change the texts in js/content/
   and run the script again. The pages' look is css/pages.css.
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

/* ---------- 1. Read the site's own texts ---------- */

const texts = { en: {}, ru: {} };
const content = {};
// A stand-in for the site's "AICompass" object: it only collects the texts
const anything = new Proxy(function () {}, { get: () => anything, apply: () => anything });
const A = new Proxy({
    addTranslations(all) { LANGS.forEach((lang) => Object.assign(texts[lang], all[lang] || {})); },
    content: { set(name, data) { content[name] = data; }, get(name) { return content[name]; } }
}, { get: (target, key) => (key in target ? target[key] : anything) });

["lessons.js", "lessons-deep.js", "lessons-world.js", "glossary.js", "glossary-terms.js"].forEach((file) => {
    const code = fs.readFileSync(path.join(ROOT, "js/content", file), "utf8");
    vm.runInNewContext(code, { window: { AICompass: A }, AICompass: A }, { filename: file });
});

const t = (lang, key) => texts[lang][key];
const esc = (text) => String(text).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
const plain = (html) => String(html).replace(/<[^>]+>/g, "").replace(/\s+/g, " ").trim();
// "Neural Networks" + "simple explanation" -> "Neural Networks: simple explanation";
// after a title that ends in "?" or "!" the second part starts a new sentence
const joinTitle = (name, rest) => (/[?!]$/.test(name) ? name + " " + rest.charAt(0).toUpperCase() + rest.slice(1) : name + ": " + rest);
const slug = (text) => plain(text).toLowerCase().replace(/&[a-z]+;/g, " ").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

// The words of the pages themselves
const W = {
    en: {
        site: "AI Compass", tagline: "Learn how AI works, free and without sign-up.",
        lessons: "Lessons", glossary: "AI words", home: "Home",
        lessonsTitle: "AI lessons for beginners: short, free, step by step",
        lessonsDesc: "15 short lessons about artificial intelligence in plain words: what AI is, how machines learn, neural networks, chatbots, fairness and safety. Free, no sign-up.",
        lessonsLead: "Fifteen short lessons in plain words. Read one here, then open it in the app to try its mini-lab and check yourself.",
        glossaryTitle: "AI glossary: artificial intelligence words in simple language",
        glossaryDesc: "Every important AI word explained in one plain sentence, with an everyday example: neural network, machine learning, token, bias and more.",
        glossaryLead: "Every important AI word in one plain sentence, with an everyday example.",
        lessonTitle: (n) => joinTitle(n, "simple explanation for beginners"),
        termTitle: (n) => joinTitle(n, "simple definition and example"),
        lesson: "Lesson", minutes: "min read", keys: "Key points", check: "Check yourself", answer: "Show the answer",
        fact: "Did you know?", example: "Example", simple: "In simple words", related: "Related words",
        taught: "Lessons that teach it", next: "Next lesson", prev: "Previous lesson",
        ctaLesson: "Do this lesson in the app", ctaLessonText: "Try the mini-lab, take the quiz and keep your progress. Free, no sign-up.",
        ctaTerm: "Open it in the glossary", ctaTermText: "Flashcards, search and all the AI words, free and without sign-up.",
        ctaAll: "Open AI Compass", other: "Русский", made: "A free student project. No ads, no sign-up.",
        allLessons: "All lessons", allTerms: "All AI words",
        go: {
            quiz: { hash: "quiz", title: "Can you beat my score in the AI Challenge?", desc: "A quick quiz about artificial intelligence on AI Compass. Free, no sign-up. Take it and see who knows more.", button: "Take the quiz" },
            exam: { hash: "learn", title: "I passed the AI Compass qualifying exam. Can you?", desc: "30 questions on how AI really works, at the end of a free path that starts from zero. No sign-up.", button: "Start my path" },
            certificate: { hash: "lessons", title: "I earned an AI Compass certificate", desc: "Short, free lessons about artificial intelligence, with a certificate at the end. No sign-up. Earn yours.", button: "Open the lessons" }
        }
    },
    ru: {
        site: "AI Compass", tagline: "Узнай, как работает ИИ: бесплатно и без регистрации.",
        lessons: "Уроки", glossary: "Слова об ИИ", home: "Главная",
        lessonsTitle: "Уроки об ИИ для начинающих: коротко, бесплатно, шаг за шагом",
        lessonsDesc: "15 коротких уроков об искусственном интеллекте простыми словами: что такое ИИ, как учатся машины, нейросети, чат-боты, справедливость и безопасность. Бесплатно и без регистрации.",
        lessonsLead: "Пятнадцать коротких уроков простыми словами. Прочитай урок здесь, а потом открой его в приложении: там мини-лаборатория и проверка.",
        glossaryTitle: "Словарь ИИ: термины искусственного интеллекта простыми словами",
        glossaryDesc: "Каждое важное слово об ИИ в одном простом предложении и с примером из жизни: нейросеть, машинное обучение, токен, предвзятость и другие.",
        glossaryLead: "Каждое важное слово об ИИ в одном простом предложении и с примером из жизни.",
        lessonTitle: (n) => joinTitle(n, "простое объяснение для начинающих"),
        termTitle: (n) => joinTitle(n, "простое определение и пример"),
        lesson: "Урок", minutes: "мин чтения", keys: "Главное", check: "Проверь себя", answer: "Показать ответ",
        fact: "А ты знал?", example: "Пример", simple: "Простыми словами", related: "Связанные слова",
        taught: "Уроки, где это объясняется", next: "Следующий урок", prev: "Предыдущий урок",
        ctaLesson: "Пройти этот урок в приложении", ctaLessonText: "Мини-лаборатория, тест и сохранение прогресса. Бесплатно и без регистрации.",
        ctaTerm: "Открыть в словаре", ctaTermText: "Карточки, поиск и все слова об ИИ: бесплатно и без регистрации.",
        ctaAll: "Открыть AI Compass", other: "English", made: "Бесплатный школьный проект. Без рекламы и регистрации.",
        allLessons: "Все уроки", allTerms: "Все слова об ИИ",
        go: {
            quiz: { hash: "quiz", title: "Сможешь набрать больше меня в ИИ-испытании?", desc: "Короткий тест об искусственном интеллекте на AI Compass. Бесплатно и без регистрации. Пройди и узнай, кто знает больше.", button: "Пройти тест" },
            exam: { hash: "learn", title: "Мой квалификационный экзамен AI Compass сдан. А ты сдашь?", desc: "30 вопросов о том, как на самом деле работает ИИ, в конце бесплатного пути с нуля. Без регистрации.", button: "Начать мой путь" },
            certificate: { hash: "lessons", title: "У меня сертификат AI Compass", desc: "Короткие бесплатные уроки об искусственном интеллекте с сертификатом в конце. Без регистрации. Получи свой.", button: "Открыть уроки" }
        }
    }
};

/* ---------- 2. The lessons and the words ---------- */

const lessons = [];
for (let n = 1; t("en", `lessons.l${n}.title`); n++) {
    const track = TRACKS.find((item) => n >= item.from && n <= item.to) || TRACKS[TRACKS.length - 1];
    lessons.push({ n, track, slug: slug(t("en", `lessons.l${n}.title`)) });
}
const glossary = content.glossary;
const terms = glossary.terms;
const termById = Object.fromEntries(terms.map((term) => [term.id, term]));

/* ---------- 3. One page ---------- */

// folder: "lessons" or "glossary"; file: "what-is-ai.html" or "index.html"
function address(lang, folder, file) {
    return SITE + (lang === "ru" ? "ru/" : "") + folder + "/" + (file === "index.html" ? "" : file);
}

function page(lang, folder, file, o) {
    const w = W[lang];
    const up = lang === "ru" ? "../../" : "../";
    const otherLang = lang === "ru" ? "en" : "ru";
    const self = address(lang, folder, file);
    const crumbs = [{ name: w.site, url: SITE + "?lang=" + lang }, { name: w[folder], url: address(lang, folder, "index.html") }];
    if (file !== "index.html") crumbs.push({ name: o.h1, url: self });
    const jsonld = [o.jsonld, {
        "@context": "https://schema.org", "@type": "BreadcrumbList",
        itemListElement: crumbs.map((c, i) => ({ "@type": "ListItem", position: i + 1, name: c.name, item: c.url }))
    }].filter(Boolean);
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
<meta property="og:type" content="article">
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
${jsonld.map((item) => `<script type="application/ld+json">${JSON.stringify(item).replace(/</g, "\\u003c")}</script>`).join("\n")}
</head>
<body>
<header class="pg-top">
    <a class="pg-logo" href="${up}index.html?lang=${lang}">🧭 AI <span>Compass</span></a>
    <nav aria-label="${esc(w.site)}">
        <a href="${up}${lang === "ru" ? "ru/" : ""}lessons/">${w.lessons}</a>
        <a href="${up}${lang === "ru" ? "ru/" : ""}glossary/">${w.glossary}</a>
        <a href="${address(otherLang, folder, file)}" hreflang="${otherLang}" lang="${otherLang}">${w.other}</a>
    </nav>
</header>
<main class="pg-main">
<p class="pg-crumbs">${crumbs.slice(0, file === "index.html" ? 1 : 2).map((c) => `<a href="${c.url}">${esc(c.name)}</a>`).join(" › ")}</p>
${o.body}
</main>
<footer class="pg-foot">
    <p>${w.made}</p>
    <p><a class="pg-btn" href="${up}index.html?lang=${lang}">${w.ctaAll}</a></p>
</footer>
</body>
</html>
`;
    const target = path.join(ROOT, lang === "ru" ? "ru" : "", folder, file);
    fs.mkdirSync(path.dirname(target), { recursive: true });
    fs.writeFileSync(target, html);
    return self;
}

function cta(lang, hash, title, text) {
    const up = lang === "ru" ? "../../" : "../";
    return `<aside class="pg-cta"><p>${text}</p><a class="pg-btn" href="${up}index.html?lang=${lang}#${hash}">${title} →</a></aside>`;
}

/* ---------- 4. The lesson pages ---------- */

const written = [];   // { folder, file } of every page, for the sitemap

function lessonPage(lang, lesson) {
    const w = W[lang];
    const k = (name) => t(lang, `lessons.l${lesson.n}.${name}`);
    const title = plain(k("title"));
    let words = 0;
    let body = "";
    for (let s = 1; k(`s${s}.h`); s++) {
        body += `<h2>${k(`s${s}.h`)}</h2>\n<p>${k(`s${s}.p`)}</p>\n`;
        if (k(`s${s}.note`)) body += `<p class="pg-note"><strong>${w.fact}</strong> ${k(`s${s}.note`)}</p>\n`;
        words += plain(k(`s${s}.p`)).split(" ").length;
    }
    let keys = "";
    for (let i = 1; k(`key${i}`); i++) keys += `<li>${k(`key${i}`)}</li>`;
    let answers = "";
    for (let i = 1; k(`a${i}`); i++) answers += `<li>${k(`a${i}`)}</li>`;
    const check = k("q") ? `<section class="pg-check"><h2>${w.check}</h2><p>${k("q")}</p><ol type="A">${answers}</ol>` +
        `<details><summary>${w.answer}</summary><p>${k("explain")}</p></details></section>` : "";
    const prev = lessons[lesson.n - 2];
    const next = lessons[lesson.n];
    const link = (other, label) => other
        ? `<a href="${other.slug}.html"><small>${label}</small>${plain(t(lang, `lessons.l${other.n}.title`))}</a>` : "<span></span>";
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
<p class="pg-kicker">${lesson.track.icon} ${plain(t(lang, `lessons.track.${lesson.track.id}.title`) || "")} · ${w.lesson} ${lesson.n} · ${Math.max(2, Math.round(words / 180))} ${w.minutes}</p>
<h1>${k("title")}</h1>
<p class="pg-lead">${k("desc")}</p>
${body}<section class="pg-keys"><h2>${w.keys}</h2><ul>${keys}</ul></section>
${check}
${cta(lang, "lesson-" + lesson.n, w.ctaLesson, w.ctaLessonText)}
<nav class="pg-pager" aria-label="${w.lessons}">${link(prev, w.prev)}${link(next, w.next)}</nav>
</article>`
    });
    written.push({ folder: "lessons", file });
}

function lessonsIndex(lang) {
    const w = W[lang];
    const groups = TRACKS.map((track) => {
        const items = lessons.filter((lesson) => lesson.track === track).map((lesson) =>
            `<li><a href="${lesson.slug}.html">${plain(t(lang, `lessons.l${lesson.n}.title`))}</a><span>${plain(t(lang, `lessons.l${lesson.n}.desc`))}</span></li>`).join("\n");
        return `<h2>${track.icon} ${plain(t(lang, `lessons.track.${track.id}.title`) || "")}</h2>\n<ol class="pg-list" start="${track.from}">${items}</ol>`;
    }).join("\n");
    page(lang, "lessons", "index.html", {
        title: w.lessonsTitle, desc: w.lessonsDesc, h1: w.lessons,
        jsonld: {
            "@context": "https://schema.org", "@type": "Course", name: w.lessonsTitle, description: w.lessonsDesc,
            inLanguage: lang, isAccessibleForFree: true, provider: { "@type": "Organization", name: "AI Compass", url: SITE }
        },
        body: `<h1>${w.lessonsTitle}</h1>\n<p class="pg-lead">${w.lessonsLead}</p>\n${groups}\n${cta(lang, "learn", w.ctaAll, w.tagline)}`
    });
    written.push({ folder: "lessons", file: "index.html" });
}

/* ---------- 5. The glossary pages ---------- */

function termPage(lang, term) {
    const w = W[lang];
    const text = term[lang];
    const related = (term.related || []).map((id) => termById[id]).filter(Boolean).map((other) =>
        `<li><a href="${other.id}.html">${esc(other[lang].name)}</a><span>${esc(other[lang].short)}</span></li>`).join("\n");
    const taught = (term.lessons || []).map((n) => lessons[n - 1]).filter(Boolean).map((lesson) =>
        `<li><a href="../lessons/${lesson.slug}.html">${w.lesson} ${lesson.n}: ${plain(t(lang, `lessons.l${lesson.n}.title`))}</a></li>`).join("");
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
    written.push({ folder: "glossary", file });
}

function glossaryIndex(lang) {
    const w = W[lang];
    const groups = glossary.categories.map((cat) => {
        const items = terms.filter((term) => term.cat === cat).map((term) =>
            `<li><a href="${term.id}.html">${esc(term[lang].name)}</a><span>${esc(term[lang].short)}</span></li>`).join("\n");
        return `<h2>${esc(t(lang, "glossary.cat." + cat) || cat)}</h2>\n<ul class="pg-list">${items}</ul>`;
    }).join("\n");
    page(lang, "glossary", "index.html", {
        title: w.glossaryTitle, desc: w.glossaryDesc, h1: w.glossary,
        jsonld: { "@context": "https://schema.org", "@type": "DefinedTermSet", name: w.glossaryTitle, description: w.glossaryDesc, inLanguage: lang },
        body: `<h1>${w.glossaryTitle}</h1>\n<p class="pg-lead">${w.glossaryLead}</p>\n${groups}\n${cta(lang, "glossary", w.ctaAll, w.tagline)}`
    });
    written.push({ folder: "glossary", file: "index.html" });
}

LANGS.forEach((lang) => {
    lessonsIndex(lang);
    lessons.forEach((lesson) => lessonPage(lang, lesson));
    glossaryIndex(lang);
    terms.forEach((term) => termPage(lang, term));
});

/* ---------- 6. The pages a shared result opens first ----------
   A learner shares ".../go/quiz.html?s=8-10" (js/invite.js). A chat app reads this page's
   title and text for the preview of the link; a person is sent straight on to the site,
   which then shows "A friend got 8 of 10. Can you beat that?".
   (kind: the name in the site's address, ?friend=quiz.8-10) */

const GO = [{ file: "quiz", kind: "quiz" }, { file: "exam", kind: "exam" }, { file: "certificate", kind: "cert" }];

function goPage(lang, item) {
    const w = W[lang];
    const words = w.go[item.file];
    const up = lang === "ru" ? "../../" : "../";
    const self = SITE + (lang === "ru" ? "ru/" : "") + "go/" + item.file + ".html";
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
    const target = path.join(ROOT, lang === "ru" ? "ru" : "", "go", item.file + ".html");
    fs.mkdirSync(path.dirname(target), { recursive: true });
    fs.writeFileSync(target, html);
}
LANGS.forEach((lang) => GO.forEach((item) => goPage(lang, item)));

/* ---------- 7. The sitemap ---------- */

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
     The app itself is one page in two languages (?lang=en, ?lang=ru); every lesson and
     glossary word also has a plain page of its own, in English and in Russian. -->
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xhtml="http://www.w3.org/1999/xhtml">
${urls}</urlset>
`);

console.log(`Wrote ${seen.size * 2} pages (${lessons.length} lessons, ${terms.length} words, 2 languages) and sitemap.xml`);
