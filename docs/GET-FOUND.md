# How people find AI Compass by themselves

The site now has two ways to grow without advertising. Both work on their own
once the steps below are done.

## 1. Search engines

Every lesson, every glossary word, every lesson plan for teachers and every
step of the learning path has a plain page of its own, in English and in
Russian (for example `lessons/what-is-ai.html`, `teachers/what-is-ai.html` and
`ru/glossary/neural-network.html`). The AI Lab, the history of AI and the quiz
have a page each. Someone who searches "what is a neural network" or "AI lesson
plan" can land on such a page and continue in the app with one button.

Google finds new pages slowly when nobody tells it about them. Telling it
takes about ten minutes, once:

1. Open https://search.google.com/search-console and sign in with a Google account.
2. Choose **URL prefix** (the right-hand box) and enter
   `https://newfter.github.io/AI-Compass/`
3. Google asks you to prove that the site is yours. Choose **HTML tag**. It shows
   one line that starts with `<meta name="google-site-verification"`.
4. Copy that line and send it in the project thread (or paste it into the
   `<head>` of `index.html`, below the description). It is not a secret.
5. After the change is merged, press **Verify** in Search Console.
6. In the menu on the left open **Sitemaps**, type `sitemap.xml` and press **Submit**.

After that Google reads all 325 addresses by itself. The first pages usually
appear within days, the rest within a few weeks. Search Console then shows
which searches bring visitors.

Bing, Yandex and some other search engines need nothing from you: every time
the pages change, a small job on GitHub (`.github/workflows/indexnow.yml`) sends
them the list of pages. You can see its runs in the repository's **Actions** tab
("Tell search engines about the pages").

## 2. One learner brings the next

The quiz result, a passed qualifying exam and a certificate have a button
("Challenge a friend" / "Share"). It sends a short text with a link. The friend
who opens the link sees "A friend got 8 of 10. Can you beat that?" and, after
their own quiz, who did better. No account is needed and nothing is stored on
a server: the result travels inside the link.

## When a text of the site changes

The plain pages are copies of the texts in `js/content/`. After a change, run

    node tools/build-pages.js

and upload the changed pages together with the change.
