# How people find AI Compass by themselves

The site now has two ways to grow without advertising. Both work on their own
once the steps below are done.

## 1. Search engines

Every lesson and every glossary word has a plain page of its own, in English
and in Russian (for example `lessons/what-is-ai.html` and
`ru/glossary/neural-network.html`). Someone who searches "what is a neural
network" can land on that page and continue in the app with one button.

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

After that Google reads all 189 addresses by itself. The first pages usually
appear within days, the rest within a few weeks. Search Console then shows
which searches bring visitors.

Bing (which also feeds other search engines) can copy everything from Google:
https://www.bing.com/webmasters → **Import from Google Search Console**.

## 2. One learner brings the next

The quiz result, a passed qualifying exam and a certificate have a button
("Challenge a friend" / "Share"). It sends a short text with a link. The friend
who opens the link sees "A friend got 8 of 10. Can you beat that?" and, after
their own quiz, who did better. No account is needed and nothing is stored on
a server: the result travels inside the link.

## When a lesson or a glossary word changes

The plain pages are copies of the texts in `js/content/`. After a change, run

    node tools/build-pages.js

and upload the changed pages together with the change.
