/* =========================================================
   AI COMPASS — TEXTS: THE PRIVACY PAGE
   What the site keeps about a person, where and why, in English and in
   Russian (informal "ты"). tools/build-pages.js writes privacy.html and
   ru/privacy.html from it: change a text here (in both languages), then run
       node tools/build-pages.js
   Keep it true. When the site starts keeping something new, say it here first.
   Where the facts come from: docs/ACCOUNTS-SETUP.md ("What the site stores"),
   js/account.js, js/count.js and supabase/schema.sql (part 8, counting visits).
   A text may use <strong> and <a>. In "text", a string is a paragraph and a
   list in [ ] is a list with dots.
   ========================================================= */

window.AICompass.content.set("privacy", {
    en: {
        link: "Privacy",
        title: "Privacy: what AI Compass keeps, and why",
        desc: "What AI Compass saves about you, where and why, in plain words: your progress stays in your browser, a Google account is optional, and visits are counted without personal data.",
        h1: "Privacy: what AI Compass keeps, and why",
        lead: "AI Compass is a free student project for learning about AI. It needs very little about you, and most of it never leaves your device. Here is all of it, in plain words.",
        short: {
            title: "In short",
            items: [
                "Your progress stays in your browser, on your device.",
                "An account is optional. With one, your progress is also kept online, and only your nickname is public.",
                "Visits are counted with a random number, never with your name, e-mail or IP address.",
                "No cookies, no advertising, no trackers from other companies."
            ]
        },
        sections: [
            {
                id: "your-device",
                title: "Your progress stays on your device",
                text: [
                    "Finished lessons, quiz results, flashcards, your learning path and your settings are saved in your browser, on this device (in its “local storage”). They are not sent anywhere.",
                    "Several people can learn on one device, each with a local account of their own. That stays on the device too.",
                    "You can delete it in Settings → Account, or by clearing this site's data in your browser."
                ]
            },
            {
                id: "account",
                title: "A Google account is optional",
                text: [
                    "Everything works without an account. If you sign in with Google, your progress is also saved online, so you can go on learning on another device, and you can take part in the Knowledge Challenge. Then AI Compass keeps:",
                    [
                        "<strong>your e-mail address</strong> and the name on your Google account, so that the site knows it is you. The site never shows them to anyone; only the owner of AI Compass can see them, in the database;",
                        "<strong>a nickname</strong>. It is public: everyone can see it on the leaderboard;",
                        "<strong>your progress</strong>, the same as in your browser;",
                        "<strong>your learning diary</strong>: the results you see in My Compass;",
                        "<strong>your Knowledge Challenge attempts</strong>: your answers, your score and your time."
                    ],
                    "You can delete your account and everything kept with it at any time, in Settings → Account."
                ]
            },
            {
                id: "counting",
                title: "Counting visits, without personal data",
                text: [
                    "To know how many people use AI Compass, the site counts visits. Once a day, your browser sends:",
                    [
                        "a random number made by your browser. It says nothing about you, and a new one replaces it every 13 months;",
                        "the language of the site: English or Russian;",
                        "whether the app or a plain page like this one was opened, whether the app is installed, and whether you are signed in."
                    ],
                    "AI Compass does not keep your IP address. It uses no cookies, no advertising and no trackers from other companies.",
                    "The daily records are deleted after 35 days. What stays: totals, like “120 devices today”, and for each random number the first and the last day it was seen and on how many days. That is deleted too, 13 months after the number was first seen.",
                    "If “Do Not Track” or “Global Privacy Control” is switched on in your browser, nothing is counted."
                ]
            },
            {
                id: "other-companies",
                title: "Other companies the site uses",
                text: [
                    [
                        "<strong>GitHub Pages</strong> hosts the site. Like every web host, GitHub sees your IP address and keeps server logs.",
                        "<strong>Google Fonts</strong>: the letters of the app come from Google's servers, so Google sees your IP address when you open the app.",
                        "<strong>Supabase</strong> keeps the accounts and the visit counts. Like every server, it sees your IP address when your browser connects and may keep it for a short time in its server logs. The tables of AI Compass never save it.",
                        "<strong>Google sign-in</strong>, only if you choose it: Google then tells AI Compass your e-mail address and name."
                    ]
                ]
            },
            {
                id: "children",
                title: "Children",
                text: [
                    "AI Compass is made for learning, at home and at school. Everything works without an account, and an account is optional. The only public thing is the nickname on the leaderboard, so don't use your real name in it.",
                    "Google accounts have their own age rules. Younger children can use the whole site without signing in, except the Knowledge Challenge."
                ]
            },
            {
                id: "questions",
                title: "Questions",
                text: [
                    "Ask on GitHub: <a href=\"https://github.com/Newfter/AI-Compass/issues\">github.com/Newfter/AI-Compass/issues</a>. Everything written there is public, so don't put private details in it."
                ]
            }
        ]
    },

    ru: {
        link: "Конфиденциальность",
        title: "Конфиденциальность: что хранит AI Compass и зачем",
        desc: "Что AI Compass сохраняет о тебе, где и зачем, простыми словами: прогресс остаётся в твоём браузере, аккаунт Google — по желанию, а посещения считаются без личных данных.",
        h1: "Конфиденциальность: что хранит AI Compass и зачем",
        lead: "AI Compass — бесплатный школьный проект, чтобы разобраться, как работает ИИ. Ему почти ничего о тебе не нужно, и почти всё остаётся на твоём устройстве. Здесь всё, что он хранит, простыми словами.",
        short: {
            title: "Коротко",
            items: [
                "Твой прогресс хранится в браузере, на твоём устройстве.",
                "Аккаунт — по желанию. С ним прогресс хранится и в интернете, а всем виден только твой ник.",
                "Посещения считаются по случайному номеру, а не по имени, e-mail или IP-адресу.",
                "Никаких cookie, рекламы и трекеров других компаний."
            ]
        },
        sections: [
            {
                id: "your-device",
                title: "Твой прогресс остаётся на твоём устройстве",
                text: [
                    "Пройденные уроки, результаты викторин, карточки, твой путь и настройки хранятся в браузере на этом устройстве (в его «локальном хранилище»). Никуда они не отправляются.",
                    "На одном устройстве могут учиться несколько человек, у каждого свой локальный аккаунт. Он тоже остаётся на устройстве.",
                    "Удалить всё это можно в Настройках → Аккаунт или очистив данные этого сайта в браузере."
                ]
            },
            {
                id: "account",
                title: "Аккаунт Google — по желанию",
                text: [
                    "Всё работает и без аккаунта. Если войти через Google, прогресс сохранится и в интернете: можно продолжать учиться на другом устройстве и участвовать в «Проверке знаний». Тогда AI Compass хранит:",
                    [
                        "<strong>твой адрес e-mail</strong> и имя из аккаунта Google, чтобы сайт узнавал тебя. Сайт их никому не показывает; их может увидеть только владелец AI Compass, в базе данных;",
                        "<strong>ник</strong>. Он публичный: его видят все в таблице лидеров;",
                        "<strong>твой прогресс</strong> — такой же, как в браузере;",
                        "<strong>твой дневник учёбы</strong>: результаты, которые ты видишь в «Моём компасе»;",
                        "<strong>твои попытки в «Проверке знаний»</strong>: ответы, баллы и время."
                    ],
                    "Удалить аккаунт и всё, что с ним хранится, можно в любой момент: Настройки → Аккаунт."
                ]
            },
            {
                id: "counting",
                title: "Подсчёт посещений без личных данных",
                text: [
                    "Чтобы знать, сколько людей пользуются AI Compass, сайт считает посещения. Раз в день твой браузер отправляет:",
                    [
                        "случайный номер, который придумал твой браузер. Он ничего о тебе не говорит, и раз в 13 месяцев его сменяет новый;",
                        "язык сайта: английский или русский;",
                        "что было открыто — приложение или простая страница вроде этой, установлено ли приложение и выполнен ли вход в аккаунт."
                    ],
                    "AI Compass не хранит твой IP-адрес. Здесь нет cookie, рекламы и трекеров других компаний.",
                    "Записи по дням удаляются через 35 дней. Остаются итоги, например «120 устройств сегодня», а для каждого случайного номера — первый и последний день, когда его видели, и сколько всего было таких дней. Через 13 месяцев после первого дня удаляется и это.",
                    "Если в твоём браузере включены «Не отслеживать» (Do Not Track) или Global Privacy Control, ничего не считается."
                ]
            },
            {
                id: "other-companies",
                title: "Другие компании, услугами которых пользуется сайт",
                text: [
                    [
                        "<strong>GitHub Pages</strong> размещает сайт. Как любой хостинг, GitHub видит твой IP-адрес и ведёт журналы сервера.",
                        "<strong>Google Fonts</strong>: шрифты приложения загружаются с серверов Google, поэтому Google видит твой IP-адрес, когда ты открываешь приложение.",
                        "<strong>Supabase</strong> хранит аккаунты и подсчёт посещений. Как любой сервер, он видит твой IP-адрес при подключении и может недолго хранить его в журналах сервера. Таблицы AI Compass его не сохраняют.",
                        "<strong>Вход через Google</strong> — только если ты его выберешь. Тогда Google сообщает AI Compass твой e-mail и имя."
                    ]
                ]
            },
            {
                id: "children",
                title: "Дети",
                text: [
                    "AI Compass сделан для учёбы — дома и в школе. Всё работает без аккаунта, аккаунт — по желанию. Публичен только ник в таблице лидеров, поэтому не используй в нём своё настоящее имя.",
                    "У аккаунтов Google свои правила о возрасте. Младшие дети могут пользоваться всем сайтом без входа, кроме «Проверки знаний»."
                ]
            },
            {
                id: "questions",
                title: "Вопросы",
                text: [
                    "Задай вопрос на GitHub: <a href=\"https://github.com/Newfter/AI-Compass/issues\">github.com/Newfter/AI-Compass/issues</a>. Всё, что там написано, видят все, поэтому не пиши туда ничего личного."
                ]
            }
        ]
    }
});
