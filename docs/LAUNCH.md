# AI Compass: the launch guide

This guide is for the people who run AI Compass, not for the people who change its code (that is
`README.md`). It says what the product is, what you switch on once, how to read the user numbers,
and what to do so that it keeps running by itself.

- Site: https://newfter.github.io/AI-Compass/
- Your numbers: https://newfter.github.io/AI-Compass/stats.html (bookmark it; it is not linked from the site)
- Privacy page: https://newfter.github.io/AI-Compass/privacy.html (Russian: `ru/privacy.html`)
- Questions and bug reports from users: https://github.com/Newfter/AI-Compass/issues

## 1. What is finished

| Part | What a visitor gets |
| --- | --- |
| Learning | My path (a personal plan from zero to research level, a daily session, a memory check), 15 lessons, the AI Lab, the Research lab (Pro design), the quiz, the glossary, the history of AI, the teachers' kit, the qualifying exam. English and Russian. |
| Progress without an account | Everything is saved in the browser at once. Several people on one computer can each have their own learner under **Settings → Account → Learners on this device**. |
| An account (optional) | **Settings → Account → Sign in with Google.** The progress of every part of the site (My path, lessons, quiz, flashcards, the exam, notes, the look and the settings) is saved online and comes back on any phone or computer. Only a nickname is public (on the Knowledge Challenge leaderboard). Everything can be deleted there too. |
| The app | Every browser that can install a website shows **Install the app** (in the footer and in **Settings → The app**), or the exact steps where the browser has no button (iPhone, iPad, Mac Safari, Firefox on Android). It works offline after the first visit. |
| Your user numbers | Active users per day, week and month, new visitors and accounts, without personal data. |
| Found by search engines | A plain page for every lesson, word, lesson plan and path step (`sitemap.xml`), a job that tells Bing about changes, and "Challenge a friend" links. |

## 2. The one-time switch-on (only you can do it)

Accounts, the Knowledge Challenge and the user numbers need a free Supabase project that belongs to
you. Until it exists, the site works fully, just without those three. The steps, click by click,
are in [`ACCOUNTS-SETUP.md`](ACCOUNTS-SETUP.md). In short:

1. Create the Supabase project and the Google sign-in key, and connect them (steps 1-3, about 20 minutes).
2. Send the **Project URL** and the **anon / publishable key** in the project thread. Claude puts
   them into `js/config.js`. Never send the secret key, the service_role key or the database password.
3. In Supabase, **SQL Editor → New query**: paste all of `supabase/schema.sql`, **Run**; then the
   same with the private `seed.sql` (the challenge questions, sent to you in the project thread,
   never put on GitHub).
4. Open the site, sign in once on your phone and once on your computer, and play one Knowledge
   Challenge round. The next day, open the numbers page.

Running `schema.sql` again later is safe: it keeps every row and only adds what is new.

## 3. How it works, in one picture

```
Visitor's browser ──────────── GitHub Pages (the site's files; free)
   │  saves progress at once in the browser (localStorage)
   │
   ├─ signed in? ────────────── Supabase: accounts, nicknames, saved progress,
   │                            the challenge and its leaderboard (free plan)
   └─ once a day ────────────── Supabase: "a device was here today" (the numbers)

GitHub Actions (free, automatic):
   keep-awake.yml  every day 06:17 UTC: wakes the database, so the free project never pauses
   indexnow.yml    after every change on main: tells Bing which pages changed
```

- **The site is just files.** A change merged into `main` is live for everyone within a minute or
  two. There is no server of ours to run or pay for.
- **Progress is safe in two places.** It is always in the browser. With an account, it is also
  online, and two devices are merged so that nothing is lost: finished steps are added together,
  the best score wins, and a deliberate "Start over" stays a start over everywhere.
- **Signing out** asks whether to remove the progress from that device. Removing is ticked by
  default, which is right for school computers; nothing is lost, it comes back at the next sign-in.

## 4. Reading the user numbers

Open https://newfter.github.io/AI-Compass/stats.html. The page shows:

| Tile | What it means |
| --- | --- |
| **Active today** | Devices that opened the site today. The day starts at midnight UTC (London time in winter). |
| **Yesterday** | The same for the whole of yesterday. |
| **Last 7 days** | Weekly active users: different devices in the last 7 days. **This is the main number to watch.** |
| **Last 30 days** | Monthly active users: different devices in the last 30 days. |
| **New visitors this week** | Devices that came for the first time. Watch it after you share the site somewhere: it shows whether that worked. |
| **Accounts** | People who signed in with Google: in total and new this week. |
| **Use the installed app** | The share of visits from the installed app. |
| **Language** | The share of English and Russian visits. |

The chart shows the daily, weekly and monthly numbers for the last 30, 90 or 365 days.

**How to judge success.** Compare each week's "Last 7 days" with the week before. Growth that holds
for several weeks means the site is spreading. If "Active today" divided by "Last 30 days" grows,
people come back more often, which is what a learning site wants.

**What the numbers are not.**
- They count devices, not people: one person with a phone and a laptop counts twice, and a school
  computer used by a whole class counts once a day.
- Visitors with "Do Not Track" or "Global Privacy Control" switched on are not counted, so the real
  numbers are a little higher.
- Counting starts on the day the Supabase project is switched on; there are no numbers from before.
- The counting is open to the public key, so someone could add fake visits on purpose. This is
  unlikely for a school project; a sudden jump that nothing explains is the sign to look for.

**Without the page**, in Supabase: **SQL Editor → New query**, paste and **Run**:

```sql
select day, dau as active_that_day, wau as last_7_days, mau as last_30_days,
       new_visitors, accounts_total, accounts_new
from public.visit_days order by day desc limit 30;
```

Visitors see what is counted on the privacy page: a random device number once a day, the language,
app or web page, installed or not, signed in or not. No name, no e-mail, no IP address, no cookies.

## 5. The app in the stores (optional)

The site already installs from the browser on every platform, for free. Store listings are extra:

| Store | What it takes | Cost |
| --- | --- | --- |
| Microsoft Store (Windows) | Package the site with https://www.pwabuilder.com and submit it. Needs the privacy page (done). | Free for individual developers since September 2025 (ID check, no card). |
| Google Play (Android) | A "Trusted Web Activity" made with PWABuilder or Bubblewrap. A new personal account must first run a closed test with at least 12 testers for 14 days. Play also needs a file at `https://newfter.github.io/.well-known/assetlinks.json`, the root of Newfter's GitHub Pages address, which this project's site cannot provide: Newfter would create the repository `newfter.github.io` with that file (plus an empty `.nojekyll`), or the site would move to its own domain (about $10-15 a year). | $25 once. |
| Apple App Store (iPhone) | Not possible for a website alone: it needs a native wrapper built on a Mac, a paid developer account and Apple's review, which often refuses apps that are only a website. iPhone users install from Safari instead (the site shows them how). | $99 a year. |

The suggested order: Microsoft Store first, Google Play only after the root-address question is settled.

## 6. Getting found

- **Google:** one step is still yours: [`GET-FOUND.md`](GET-FOUND.md) (Search Console, about 10
  minutes). Send the verification line in the project thread, and submit `sitemap.xml` after it is live.
- **Bing (and through it DuckDuckGo and others):** automatic, by the IndexNow job after every change.
- **People:** "Challenge a friend" on quiz and exam results and on certificates brings their friends
  straight into the right place.

## 7. Keeping it running

**Nothing needs doing every day.** Once a month, take five minutes:

1. Open the numbers page and note "Last 7 days" and "Last 30 days".
2. In Supabase, open the project's **Usage** page. The free plan allows about 50,000 signed-in
   people a month and 500 MB of data; one learner's progress is a few kilobytes.
3. In GitHub, **Actions**: the "Keep the database awake" job should be green. GitHub e-mails the
   repository owner when a job fails.

| If this happens | Do this |
| --- | --- |
| Supabase e-mails that the project is paused | Open the project and press **Restore project**. All data is kept. The rest of the site keeps working meanwhile. |
| The numbers page says the database can't be reached | The same: the project is paused, or the address in `js/config.js` is wrong. |
| The numbers page says a function is missing | Run `supabase/schema.sql` again in the SQL Editor. |
| Sign-in goes to an error page | In Supabase, **Authentication → URL Configuration**: the Site URL and the Redirect URL must be exactly as in `ACCOUNTS-SETUP.md`, step 3. |
| A player has a rude nickname | Supabase, **Table Editor → profiles**: change the `nickname`, or delete that person under **Authentication → Users**. |
| Someone asks you to delete their data | They can do it themselves in **Settings → Account → Delete my account**. You can do it in **Authentication → Users → Delete user**: every row of theirs goes with it. |
| A secret key was shown somewhere by mistake | In Supabase (or Google) press **Reset** / **Regenerate** for it, and paste the new one where step 3 of `ACCOUNTS-SETUP.md` says. The public anon key in `js/config.js` is not a secret. |
| You want to change a text, a lesson or a question | Edit the file in `js/content/` (both languages), then run `node tools/build-pages.js` so the plain pages follow, and merge. `README.md` has a recipe for each kind of change. Or ask Claude in the project. |
| You want to add Knowledge Challenge questions | Supabase, **Table Editor → challenge_questions**: one row per question. |

**Costs.** Everything runs on free plans: GitHub Pages (up to about 100 GB of downloads a month),
GitHub Actions (the two jobs take seconds), Supabase Free. The free Supabase plan does not promise
backups; the learners' progress also stays in their own browsers, and if the site grows a lot, the
Supabase Pro plan ($25 a month) adds daily backups and higher limits.

**Who can change the site.** Newfter owns the repository; Alexander is a collaborator. Pushes to
`main` go through pull requests, and every merged change is live a minute later.

## 8. Before you announce it: the checklist

- [ ] The launch pull request is merged and the site opens.
- [ ] The Supabase project is set up, `schema.sql` and `seed.sql` have run, and `js/config.js` has the two public values.
- [ ] You signed in on a phone and on a computer and saw the same progress on both.
- [ ] You played one Knowledge Challenge round, and your nickname is on the leaderboard.
- [ ] The next day, the numbers page shows at least your own visits.
- [ ] You installed the app on your phone once.
- [ ] Google Search Console is verified and `sitemap.xml` is submitted (`GET-FOUND.md`).
- [ ] (Optional) The Microsoft Store listing.
