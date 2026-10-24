/* =========================================================
   AI COMPASS — CORE
   Loaded before every other script. It provides:
   - translations (English / Russian) and the language button
   - light / dark theme and the theme button
   - saving settings in the browser (localStorage)
   - the mobile menu, the sticky menu and small helpers
   Every feature file uses window.AICompass (see the bottom).
   ========================================================= */

(function () {
"use strict";

// ---------- Saving settings safely ----------
// Some browsers block localStorage (private mode), so every call is wrapped.
const storage = {
    get: function (key, fallback) {
        try {
            const value = localStorage.getItem("aic:" + key);
            return value === null ? fallback : JSON.parse(value);
        } catch (error) {
            return fallback;
        }
    },
    set: function (key, value) {
        try {
            localStorage.setItem("aic:" + key, JSON.stringify(value));
        } catch (error) {}
    },
    remove: function (key) {
        try {
            localStorage.removeItem("aic:" + key);
        } catch (error) {}
    }
};

// ---------- Translations ----------
const translations = { en: {}, ru: {} };

function addTranslations(dictionary) {
    ["en", "ru"].forEach(function (lang) {
        Object.assign(translations[lang], dictionary[lang] || {});
    });
}

// t("quiz.title") returns the text in the current language.
// Optional values fill in {placeholders}: t("quiz.score", { score: 5 })
function t(key, values) {
    let text = translations[state.lang][key];
    if (text === undefined) text = translations.en[key];
    if (text === undefined) return key;
    if (values) {
        Object.keys(values).forEach(function (name) {
            text = text.split("{" + name + "}").join(values[name]);
        });
    }
    return text;
}

// Updates every element with data-i18n="key" (its content)
// and data-i18n-attr="aria-label:key,placeholder:key" (its attributes).
function applyTranslations(root) {
    root = root || document;

    root.querySelectorAll("[data-i18n]").forEach(function (element) {
        const key = element.getAttribute("data-i18n");
        if (translations.en[key] !== undefined || translations.ru[key] !== undefined) {
            // Only touch the page when the text really changes (much faster at start-up)
            const text = t(key);
            if (element.innerHTML !== text) element.innerHTML = text;
        }
    });

    root.querySelectorAll("[data-i18n-attr]").forEach(function (element) {
        element.getAttribute("data-i18n-attr").split(",").forEach(function (pair) {
            const parts = pair.split(":");
            if (parts.length === 2) {
                const name = parts[0].trim();
                const text = t(parts[1].trim());
                if (element.getAttribute(name) !== text) element.setAttribute(name, text);
            }
        });
    });
}

// ---------- State ----------
const reducedMotionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");

const state = {
    lang: storage.get("language", "en") === "ru" ? "ru" : "en",
    theme: document.documentElement.getAttribute("data-theme") === "light" ? "light" : "dark"
};

function emit(name, detail) {
    document.dispatchEvent(new CustomEvent(name, { detail: detail }));
}

function setLanguage(lang) {
    if (lang !== "en" && lang !== "ru") return;
    state.lang = lang;
    storage.set("language", lang);
    document.documentElement.lang = lang;
    applyTranslations(document);

    // The browser tab title and the page description follow the language too
    document.title = t("core.pageTitle");
    const description = document.querySelector('meta[name="description"]');
    if (description) description.setAttribute("content", t("core.pageDescription"));

    const button = document.getElementById("language-toggle");
    if (button) button.textContent = lang === "en" ? "RU" : "EN";

    emit("aic:language", { lang: lang });
}

// The colour of the browser's address bar on phones
function updateThemeMeta() {
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute("content", state.theme === "light" ? "#f4f6fd" : "#060812");
}

function setTheme(theme) {
    if (theme !== "light" && theme !== "dark") return;
    state.theme = theme;
    storage.set("theme", theme);
    document.documentElement.setAttribute("data-theme", theme);
    updateThemeMeta();

    emit("aic:theme", { theme: theme });
}

// ---------- Commands (used by the Ctrl+K command palette) ----------
// Features add their own, e.g. "Open lesson: Machine Learning".
const commands = [];

function registerCommand(command) {
    // command = { id, group, title: function () { return "text"; }, keywords, run: function () {} }
    if (!commands.some(function (existing) { return existing.id === command.id; })) {
        commands.push(command);
    }
}

// ---------- Small pop-up messages ----------
function toast(message, icon) {
    const stack = document.getElementById("toast-stack");
    if (!stack) return;

    const item = document.createElement("div");
    item.className = "toast";
    item.innerHTML = '<span class="toast-icon" aria-hidden="true"></span><span class="toast-text"></span>';
    item.querySelector(".toast-icon").textContent = icon || "✨";
    item.querySelector(".toast-text").textContent = message;
    stack.appendChild(item);

    setTimeout(function () {
        item.classList.add("toast-hide");
        setTimeout(function () { item.remove(); }, 400);
    }, 3200);
}

// ---------- Helpers ----------
// The browser's computed styles are read through one live object, so
// features that read many variables in a row don't ask for a new one each time.
let computedRoot = null;

function cssVar(name) {
    if (!computedRoot) computedRoot = getComputedStyle(document.documentElement);
    return computedRoot.getPropertyValue(name).trim();
}

function escapeHTML(text) {
    return String(text)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#39;");
}

// Smoothly scroll to a section by its id, e.g. scrollToSection("quiz").
// The keyboard focus moves to the section's heading, so the next Tab
// continues from there (and doesn't jump back to where you were).
function scrollToSection(id) {
    const target = document.getElementById(id);
    if (!target) return;
    target.scrollIntoView({ behavior: reducedMotionQuery.matches ? "auto" : "smooth", block: "start" });

    const heading = target.querySelector("h1, h2");
    if (heading) {
        if (!heading.hasAttribute("tabindex")) heading.setAttribute("tabindex", "-1");
        heading.focus({ preventScroll: true });
    }
}

// ---------- Core translations ----------
addTranslations({
    en: {
        "core.skip": "Skip to content",
        "core.searchLabel": "Search the site (Ctrl + K)",
        "core.themeLabel": "Switch light / dark theme",
        "core.langLabel": "Switch language",
        "core.menuLabel": "Open menu",
        "core.menuClose": "Close menu",
        "core.navMain": "Main menu",
        "core.navFooter": "Footer links",
        "core.pageTitle": "AI Compass | Explore Artificial Intelligence",
        "core.pageDescription": "AI Compass — a free bilingual platform for learning about Artificial Intelligence: lessons, live AI experiments, a quiz, a glossary and more.",
        "core.toastLight": "Light mode on",
        "core.toastDark": "Dark mode on",
        "core.toastLang": "Language: English",

        "nav.lessons": "Lessons",
        "nav.lab": "AI Lab",
        "nav.quiz": "Quiz",
        "nav.glossary": "Glossary",
        "nav.timeline": "History",
        "nav.about": "About",

        "hero.label": "YOUR AI JOURNEY STARTS HERE",
        "hero.titleStart": "Navigate the World of",
        "hero.titleAccent": "AI",
        "hero.subtitle": "A free, interactive guide to Artificial Intelligence for",
        "hero.rotator": "students|teachers|parents|everyone",
        "hero.ctaLessons": "Start learning",
        "hero.ctaLab": "Try the AI Lab",
        "hero.statLessons": "interactive lessons",
        "hero.statDemos": "live AI experiments",
        "hero.statQuiz": "quiz questions",
        "hero.statLanguages": "languages",
        "hero.scrollHint": "Scroll to the lessons",

        "lessons.label": "LEARN SOMETHING NEW",
        "lessons.title": "Explore the Basics",
        "lessons.subtitle": "Six short lessons. Open one, read it, check yourself, and track your progress.",

        "lab.label": "HANDS-ON EXPERIMENTS",
        "lab.title": "The AI Lab",
        "lab.subtitle": "Real machine learning, running right here in your browser. Teach a model, test it, and watch it think.",

        "quiz.label": "TEST YOURSELF",
        "quiz.title": "The AI Challenge",
        "quiz.subtitle": "Twelve questions. How well do you really know AI?",

        "glossary.label": "SPEAK THE LANGUAGE",
        "glossary.title": "AI Glossary",
        "glossary.subtitle": "The key words of Artificial Intelligence, explained simply.",

        "timeline.label": "HOW WE GOT HERE",
        "timeline.title": "A Short History of AI",
        "timeline.subtitle": "From a single question in 1950 to the AI in your pocket today.",

        "about.label": "OUR MISSION",
        "about.title": "About AI Compass",
        "about.text": "AI Compass is your starting point for exploring the world of Artificial Intelligence. It was made by students as a CAS project, to help anyone understand how AI works, how to use it wisely, and how to think about it critically.",
        "about.value1Title": "Free for everyone",
        "about.value1Text": "No sign-up, no ads, no cost. Just open it and learn.",
        "about.value2Title": "Bilingual",
        "about.value2Text": "Everything is available in English and Russian.",
        "about.value3Title": "Learn by doing",
        "about.value3Text": "Experiments, quizzes and an assistant make ideas stick.",

        "footer.tagline": "Made for curious minds.",
        "footer.cas": "A student CAS project.",
        "footer.top": "Back to top ↑",

        "cmd.groupNavigate": "Go to",
        "cmd.groupActions": "Actions",
        "cmd.home": "Home",
        "cmd.toggleTheme": "Switch light / dark theme",
        "cmd.toggleLang": "Language — switch to Russian"
    },
    ru: {
        "core.skip": "Перейти к содержанию",
        "core.searchLabel": "Поиск по сайту (Ctrl + K)",
        "core.themeLabel": "Сменить светлую / тёмную тему",
        "core.langLabel": "Сменить язык",
        "core.menuLabel": "Открыть меню",
        "core.menuClose": "Закрыть меню",
        "core.navMain": "Главное меню",
        "core.navFooter": "Ссылки в подвале сайта",
        "core.pageTitle": "AI Compass | Исследуй искусственный интеллект",
        "core.pageDescription": "AI Compass — бесплатная платформа на двух языках для знакомства с искусственным интеллектом: уроки, живые ИИ-эксперименты, тест, словарь и многое другое.",
        "core.toastLight": "Включена светлая тема",
        "core.toastDark": "Включена тёмная тема",
        "core.toastLang": "Язык: русский",

        "nav.lessons": "Уроки",
        "nav.lab": "ИИ-лаборатория",
        "nav.quiz": "Тест",
        "nav.glossary": "Словарь",
        "nav.timeline": "История",
        "nav.about": "О проекте",

        "hero.label": "ТВОЁ ПУТЕШЕСТВИЕ В МИР ИИ НАЧИНАЕТСЯ ЗДЕСЬ",
        "hero.titleStart": "Исследуй мир",
        "hero.titleAccent": "ИИ",
        "hero.subtitle": "Бесплатный интерактивный путеводитель по искусственному интеллекту для",
        "hero.rotator": "школьников|учителей|родителей|всех",
        "hero.ctaLessons": "Начать обучение",
        "hero.ctaLab": "Открыть ИИ-лабораторию",
        "hero.statLessons": "интерактивных уроков",
        "hero.statDemos": "живых ИИ-эксперимента",
        "hero.statQuiz": "вопросов в тесте",
        "hero.statLanguages": "языка",
        "hero.scrollHint": "Прокрутить к урокам",

        "lessons.label": "УЗНАЙ ЧТО-ТО НОВОЕ",
        "lessons.title": "Изучаем основы",
        "lessons.subtitle": "Шесть коротких уроков. Открой урок, прочитай, проверь себя и следи за своим прогрессом.",

        "lab.label": "ЭКСПЕРИМЕНТЫ СВОИМИ РУКАМИ",
        "lab.title": "ИИ-лаборатория",
        "lab.subtitle": "Настоящее машинное обучение прямо в твоём браузере. Обучи модель, проверь её и посмотри, как она «думает».",

        "quiz.label": "ПРОВЕРЬ СЕБЯ",
        "quiz.title": "ИИ-испытание",
        "quiz.subtitle": "Двенадцать вопросов. Насколько хорошо ты знаешь ИИ?",

        "glossary.label": "ГОВОРИ НА ЯЗЫКЕ ИИ",
        "glossary.title": "Словарь ИИ",
        "glossary.subtitle": "Главные слова искусственного интеллекта простыми словами.",

        "timeline.label": "КАК МЫ К ЭТОМУ ПРИШЛИ",
        "timeline.title": "Краткая история ИИ",
        "timeline.subtitle": "От одного вопроса в 1950 году до ИИ в твоём кармане.",

        "about.label": "НАША МИССИЯ",
        "about.title": "Об AI Compass",
        "about.text": "AI Compass — твоя отправная точка для изучения мира искусственного интеллекта. Его создали школьники в рамках проекта CAS, чтобы помочь каждому понять, как работает ИИ, как пользоваться им с умом и как оценивать его критически.",
        "about.value1Title": "Бесплатно для всех",
        "about.value1Text": "Без регистрации, рекламы и оплаты. Просто открой и учись.",
        "about.value2Title": "На двух языках",
        "about.value2Text": "Всё доступно на английском и русском.",
        "about.value3Title": "Учись на практике",
        "about.value3Text": "Эксперименты, тесты и чат-бот помогают лучше запомнить материал.",

        "footer.tagline": "Создано для любознательных умов.",
        "footer.cas": "Школьный проект CAS.",
        "footer.top": "Наверх ↑",

        "cmd.groupNavigate": "Перейти",
        "cmd.groupActions": "Действия",
        "cmd.home": "Главная",
        "cmd.toggleTheme": "Сменить светлую / тёмную тему",
        "cmd.toggleLang": "Язык — переключить на английский"
    }
});

// ---------- Public toolkit for the feature files ----------
window.AICompass = {
    storage: storage,
    addTranslations: addTranslations,
    applyTranslations: applyTranslations,
    t: t,
    get lang() { return state.lang; },
    get theme() { return state.theme; },
    setLanguage: setLanguage,
    setTheme: setTheme,
    toggleLanguage: function () { setLanguage(state.lang === "en" ? "ru" : "en"); },
    toggleTheme: function () { setTheme(state.theme === "dark" ? "light" : "dark"); },
    onLanguageChange: function (callback) {
        document.addEventListener("aic:language", function (event) { callback(event.detail.lang); });
    },
    onThemeChange: function (callback) {
        document.addEventListener("aic:theme", function (event) { callback(event.detail.theme); });
    },
    get reducedMotion() { return reducedMotionQuery.matches; },
    commands: commands,
    registerCommand: registerCommand,
    toast: toast,
    cssVar: cssVar,
    escapeHTML: escapeHTML,
    scrollToSection: scrollToSection
};

// ---------- Built-in commands ----------
[
    ["home", "cmd.home", "🏠"],
    ["lessons", "nav.lessons", "📚"],
    ["lab", "nav.lab", "🧪"],
    ["quiz", "nav.quiz", "🏆"],
    ["glossary", "nav.glossary", "📖"],
    ["timeline", "nav.timeline", "🕰️"],
    ["about", "nav.about", "💡"]
].forEach(function (item) {
    registerCommand({
        id: "go-" + item[0],
        group: "cmd.groupNavigate",
        icon: item[2],
        title: function () { return t(item[1]); },
        keywords: item[0],
        run: function () { scrollToSection(item[0]); }
    });
});

registerCommand({
    id: "toggle-theme",
    group: "cmd.groupActions",
    icon: "🌓",
    title: function () { return t("cmd.toggleTheme"); },
    keywords: "theme dark light mode night тема тёмная светлая тёмный светлый ночной режим",
    run: function () { window.AICompass.toggleTheme(); }
});

registerCommand({
    id: "toggle-language",
    group: "cmd.groupActions",
    icon: "🌐",
    title: function () { return t("cmd.toggleLang"); },
    keywords: "language english russian switch change translate язык русский английский сменить перевод",
    run: function () { window.AICompass.toggleLanguage(); }
});

// ---------- Page setup once the HTML is ready ----------
document.addEventListener("DOMContentLoaded", function () {
    document.documentElement.classList.add("js");
    setLanguage(state.lang);
    updateThemeMeta();

    // Language and theme buttons
    const languageButton = document.getElementById("language-toggle");
    if (languageButton) {
        languageButton.addEventListener("click", function () {
            window.AICompass.toggleLanguage();
            toast(t("core.toastLang"), "🌐");
        });
    }

    const themeButton = document.getElementById("theme-toggle");
    if (themeButton) {
        themeButton.addEventListener("click", function () {
            window.AICompass.toggleTheme();
            toast(t(state.theme === "light" ? "core.toastLight" : "core.toastDark"), state.theme === "light" ? "☀️" : "🌙");
        });
    }

    // Mobile menu
    const menuButton = document.getElementById("menu-toggle");
    const navLinks = document.getElementById("nav-links");
    const navbar = document.getElementById("navbar");

    function isMenuOpen() {
        return Boolean(menuButton) && menuButton.getAttribute("aria-expanded") === "true";
    }

    // The button says "Open menu" or "Close menu"
    function updateMenuLabel() {
        if (!menuButton) return;
        const key = isMenuOpen() ? "core.menuClose" : "core.menuLabel";
        menuButton.setAttribute("data-i18n-attr", "aria-label:" + key);
        menuButton.setAttribute("aria-label", t(key));
    }

    function openMenu() {
        menuButton.setAttribute("aria-expanded", "true");
        navbar.classList.add("menu-open");
        updateMenuLabel();
    }

    function closeMenu() {
        if (!isMenuOpen()) return;
        // If the focus was on a link that is about to hide, give it back to the button
        const focusWasInside = navLinks.contains(document.activeElement);
        menuButton.setAttribute("aria-expanded", "false");
        navbar.classList.remove("menu-open");
        updateMenuLabel();
        if (focusWasInside) menuButton.focus({ preventScroll: true });
    }

    if (menuButton && navLinks && navbar) {
        menuButton.addEventListener("click", function (event) {
            if (isMenuOpen()) {
                closeMenu();
                return;
            }
            openMenu();
            // Opened with the keyboard (Enter / Space): go straight to the first link
            if (event.detail === 0) {
                const firstLink = navLinks.querySelector("a");
                if (firstLink) firstLink.focus();
            }
        });

        navLinks.querySelectorAll("a").forEach(function (link) {
            link.addEventListener("click", function () {
                // The page is about to scroll to this link, so the focus stays on it
                menuButton.setAttribute("aria-expanded", "false");
                navbar.classList.remove("menu-open");
                updateMenuLabel();
            });
        });

        document.addEventListener("keydown", function (event) {
            if (event.key === "Escape") closeMenu();
        });

        // A tap or click anywhere outside the menu closes it
        document.addEventListener("pointerdown", function (event) {
            if (!isMenuOpen()) return;
            if (navLinks.contains(event.target) || menuButton.contains(event.target)) return;
            closeMenu();
        }, true);

        // So does moving the keyboard focus somewhere else (e.g. Tab past the last link)
        function onFocusOut(event) {
            const next = event.relatedTarget;
            if (!isMenuOpen() || !next) return;
            if (navLinks.contains(next) || menuButton.contains(next)) return;
            closeMenu();
        }
        navLinks.addEventListener("focusout", onFocusOut);
        menuButton.addEventListener("focusout", onFocusOut);

        // On a wide screen the links are always visible, so the menu state is reset
        // (without moving the focus: the links stay where they are)
        const wideQuery = window.matchMedia("(min-width: 961px)");
        const onWide = function () {
            if (!wideQuery.matches || !isMenuOpen()) return;
            menuButton.setAttribute("aria-expanded", "false");
            navbar.classList.remove("menu-open");
            updateMenuLabel();
        };
        if (wideQuery.addEventListener) wideQuery.addEventListener("change", onWide);
        else if (wideQuery.addListener) wideQuery.addListener(onWide);
    }

    // Menu gets a solid background once the page is scrolled,
    // and the link of the section on screen is highlighted
    // Only the page's own sections (not the sections that features put inside them)
    const sections = Array.prototype.slice.call(document.querySelectorAll("main > section[id]"));
    const links = navLinks ? Array.prototype.slice.call(navLinks.querySelectorAll("a")) : [];

    function onScroll() {
        if (navbar) navbar.classList.toggle("scrolled", window.scrollY > 10);

        let current = "";
        sections.forEach(function (section) {
            if (section.getBoundingClientRect().top < window.innerHeight * 0.35) {
                current = section.id;
            }
        });

        links.forEach(function (link) {
            link.classList.toggle("active", link.getAttribute("href") === "#" + current);
        });
    }

    window.addEventListener("scroll", onScroll, { passive: true });
    // The first check waits for the next frame, when the page is laid out anyway
    requestAnimationFrame(onScroll);
});

})();
