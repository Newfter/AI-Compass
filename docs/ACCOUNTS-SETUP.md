# Accounts, the leaderboard and the Knowledge Challenge: setting it up

AI Compass works without any of this: every visitor's progress is saved in their browser. The
account features (Sign in with Google, progress saved across devices, the Knowledge Challenge and
its leaderboard) need a small online service that must belong to the site's owner. This guide
explains, click by click, how to create it for free, and what to keep secret.

Until the two values of step 4 are in `js/config.js`, the account features stay switched off:
the site shows no sign-in button and no Challenge section, and everything else works as before.

## What you create and why

Two free accounts, about 25 minutes in total, no credit card. The site stays on GitHub Pages.

| Service | What the site uses it for | Who signs up | Cost |
| --- | --- | --- | --- |
| [Supabase](https://supabase.com) | The database (accounts, nicknames, saved progress, challenge results, leaderboards) and the sign-in service. Scores and times are checked on its server, so nobody can fake a result. | The site's owner, with a Google or GitHub account | Free plan |
| [Google Cloud Console](https://console.cloud.google.com) | The "Sign in with Google" key. Google requires that every website using Google sign-in registers itself once. | The same person, with a Google account | Free |

Why Supabase and not Firebase: Firebase can only check scores on its server on a paid plan that
needs a credit card. Supabase does it on the free plan.

One person should own both accounts and keep the passwords safe. The owner can add other admins later.

## Step 1: create the Supabase project (10 minutes)

At the end of this step you have a project page and its callback address, which step 2 needs.

1. Go to [supabase.com](https://supabase.com) and click **Start your project**. Sign up with your Google or GitHub account.
2. If Supabase asks you to create an organization, name it **AI Compass** and choose the **Free** plan.
3. Click **New project** and fill in:
   - **Name:** AI Compass
   - **Database password:** click **Generate a password**, then copy it into a safe place (a notes app). The website never needs it, but Supabase asks for it in a few advanced screens.
   - **Region:** the one closest to most of your visitors, for example **Central EU (Frankfurt)**.
4. Click **Create new project** and wait one or two minutes until the page says the project is ready.
5. In the left menu open **Authentication**, then **Sign In / Providers** (in some versions just **Providers**), and click **Google** in the list. Do not switch it on yet. Copy the long address shown there as **Callback URL (for OAuth)**. It looks like `https://abcdefghijklmnop.supabase.co/auth/v1/callback`. Keep this page open: you come back to it in step 3.

The menu names may differ slightly from these, because Supabase changes its screens from time to time.

## Step 2: create the Google sign-in key (10 minutes)

At the end of this step you have a **Client ID** and a **Client secret** from Google.

1. Go to [console.cloud.google.com](https://console.cloud.google.com) and sign in with the same Google account. Accept the terms if asked.
2. At the top, click the project selector (it says **Select a project** or shows a project name), then **New project**. Name it **AI Compass**, leave the rest as it is, and click **Create**. Wait for the notification, then click **Select project**.
3. In the search box at the top type **Google Auth Platform** and open it (in older screens it is called **APIs & Services → OAuth consent screen**). Click **Get started**.
   - **App name:** AI Compass. **User support email:** your email.
   - **Audience:** choose **External**.
   - **Contact information:** your email. Agree to the policy and click **Create**.
4. Open the **Audience** page and click **Publish app**, then confirm. This lets anyone with a Google account sign in, not only test users. The site asks Google only for the visitor's name and email address, so Google does not require a review for this.
5. Open the **Clients** page and click **Create client** (older screens: **Credentials → Create credentials → OAuth client ID**):
   - **Application type:** Web application. **Name:** AI Compass website.
   - **Authorised JavaScript origins:** add `https://newfter.github.io`
   - **Authorised redirect URIs:** add the callback address you copied in step 1 (`https://....supabase.co/auth/v1/callback`).
   - Click **Create**.
6. A window shows the **Client ID** (ends in `.apps.googleusercontent.com`) and the **Client secret**. Copy both into your safe place. You can see them again later on the Clients page.

On the Google sign-in screen visitors see "AI Compass" and the Supabase address of your project. Showing your own address instead is a paid Supabase feature, so leave that as it is.

## Step 3: connect Google to Supabase and set the site addresses (5 minutes)

1. Back in Supabase, on the **Google** provider page from step 1: switch **Enable Sign in with Google** on, paste the **Client ID** into **Client IDs** and the **Client secret** into **Client Secret (for OAuth)**, and click **Save**.
2. Still under **Authentication**, open **URL Configuration**:
   - **Site URL:** `https://newfter.github.io/AI-Compass/`
   - **Redirect URLs:** click **Add URL** and add `https://newfter.github.io/AI-Compass/**` (the two stars allow every page of the site). Save.
3. Optional but recommended: under **Authentication → Sign In / Providers**, switch **Email** off if it is on. The site only uses Google, and this closes a door nobody needs.

Visitors will see Google's normal account chooser, and the site receives only their name and email address. The site never shows the email address to anyone else.

## Step 4: put two public values into the site (2 minutes)

The website needs two values to talk to your Supabase project. Both are designed to be public (they are in the site's code that every visitor can see).

1. In Supabase, open **Project Settings** (the gear at the bottom of the left menu), then **API** (in newer versions **API Keys**).
2. Copy the **Project URL** (`https://....supabase.co`).
3. Copy the key called **anon public** (in newer versions it is on the **Publishable key** tab and starts with `sb_publishable_`). Either one works.
4. Put them into `js/config.js`:

```js
window.AICompassConfig = {
    supabaseUrl: "https://abcdefghijklmnop.supabase.co",
    supabaseAnonKey: "sb_publishable_..."
};
```

When this file is on GitHub Pages, the sign-in button, the online account's card at the top of Settings → Account, the Challenge section and the daily wake-up job (`.github/workflows/keep-awake.yml`) all switch on by themselves.

| Value | May it be public? | Why |
| --- | --- | --- |
| Project URL | Yes | It is the address the site talks to |
| anon public key or publishable key | Yes | It only allows what the privacy rules in the database allow |
| service_role key or secret key | **Never**, to anyone | It bypasses every privacy rule |
| Google Client secret | **Never**, except pasting it into Supabase in step 3 | It would let someone impersonate the site at Google |
| Database password | **Never** | Full access to the database |

If a secret value is ever pasted somewhere by mistake, Supabase and Google both have a **Reset** or **Regenerate** button for it; use it and paste the new value into Supabase again.

## Step 5: run the database setup (5 minutes)

Two SQL files set up the database:

- `supabase/schema.sql` in this repository: the tables, the privacy rules (every person can read and change only their own rows) and the scoring functions. It can be run again at any time: it updates what exists and keeps every row.
- `seed.sql`: the challenge questions with their correct answers and explanations. **This file is not in the repository on purpose**, so nobody can look up the answers; the site's owner keeps it privately (it was delivered in the project chat). To change or add questions later, edit them in Supabase (**Table Editor → challenge_questions**: every question is one row) or run an updated `seed.sql`.

1. In Supabase, open **SQL Editor** in the left menu and click **New query**.
2. Open `supabase/schema.sql`, select all the text, copy it, paste it into the editor and click **Run**. The message at the bottom should say "Success".
3. Do the same with `seed.sql` in a new query. The result shows 12 lessons with 8 questions each.
4. Open the site, sign in, and play one round of the Knowledge Challenge.

## Keeping it free and awake

The free plan is enough for a school site by a wide margin: up to 50,000 signed-in people a
month, 500 MB of data (one visitor's progress is a few kilobytes), and the questions are tiny.

- **Pause after a quiet week.** Supabase pauses a free project that nobody has used for 7 days. Every visit by anyone keeps it awake, and the scheduled job in `.github/workflows/keep-awake.yml` calls the database once a day (it reads the address and the public key from `js/config.js`). If the project ever pauses anyway, the project page shows a **Restore project** button; one click and it is back a minute later, with all data intact. The rest of the site keeps working during a pause: only sign-in, the leaderboard and the challenge wait.
- **Two free projects per account.** Keep this one for AI Compass only.
- Supabase emails the owner if the project is paused or close to a limit, so the owner's address should be one that is read.

## What the site stores, and who can see it

| Where | What | Who can see it |
| --- | --- | --- |
| `auth.users` (managed by Supabase) | the Google account's email address and name | only the owner in the Supabase dashboard; never shown on the site |
| `profiles` | the nickname | the nickname is public (the leaderboard); nothing else |
| `user_progress` | the same progress the browser saves: one row for each kind of progress (finished lessons, quiz bests, flashcards, My Compass, My path, the research notebook...), one row `lab.challenges`, one row `prefs` (the look, the language, the design, calm motion, the text sizes) and one row `bundle` with every other personal key (the teachers' kit, the timed quiz, the tools' last inputs...). At most 100 rows of 256 KB each | only that person |
| `events` | the diary of results shown in My Compass | only that person |
| `challenge_attempts` | every Knowledge Challenge attempt: the questions, the answers, the score, the time | only that person; the leaderboard shows each player's best score, time and nickname |
| `challenge_questions` | the questions with their answers | nobody from the site: the answers and explanations are only sent back after an attempt is finished |

A person can delete their account and everything with it in Settings → Account ("Delete my account", pressed twice).

## How the progress is kept in sync

Nothing needs to be set up for this: `supabase/schema.sql` already has the table. What the site does
(the details are at the top of `js/account.js`):

- **When.** On every sign-in and every visit the device merges its progress with the account's.
  After that, a change is saved a few seconds later, and also when the tab is hidden or closed.
  A save that fails (no internet, the project paused) is tried again, and the status in
  Settings → Account says so ("Offline: it will save when you're back", "Couldn't save" with
  "Try again"). Two tabs or two devices never write over each other: a write only goes through
  if the row is still what the device last saw; otherwise it reads, merges and writes again.
- **Nothing is lost.** Finished lessons, explored terms and learning days are the union of both
  devices; scores keep the best; flashcards and memory cards keep the more advanced card; the XP
  of My Compass adds up what each device earned; notes keep every note and the later edit of
  each. The look, the language and the other choices follow the latest change (a new device
  takes the account's choices first). Any other key goes into the `bundle` row: gaps are filled
  both ways, and a key changed on this device since the last save wins.
- **A reset stays a reset.** "Reset progress", "Start over", a deleted note or a mistake cleared
  from "My mistakes" while signed in is sent as a deliberate removal (a higher "epoch" on the
  row). Another device that still has the old progress does not bring it back: it keeps the
  online copy plus only what it did itself since its last save.
- **Signing out asks.** "Remove my progress from this device" is ticked by default (the safe
  choice on a shared or school computer: the next person starts fresh, and everything comes
  back on the next sign-in). The removal waits until everything is saved online: offline, the
  person stays signed in and is told why. Unticked, the progress stays on the device; another
  person who then signs in on that device does not get it in their account.

## Counting visits, and the numbers page

The same Supabase project also counts how many people use the site, without personal data. It
starts by itself once the two values are in `js/config.js` and `supabase/schema.sql` has run (its
part 8 builds the counting).

- **What is counted.** Once a day per device, `js/count.js` sends a random device number made in
  the browser, the language, the app or a plain page, installed or not, signed in or not. No
  name, e-mail or IP address is kept, and there are no cookies. It does nothing on your own
  computer (localhost), for test robots, or when Do Not Track or Global Privacy Control is on.
  Visitors read all this on `privacy.html` (linked from every footer).
- **The numbers page:** https://newfter.github.io/AI-Compass/stats.html. Bookmark it: the site does
  not link to it and search engines skip it. It shows today, yesterday, the last 7 and 30 days,
  new visitors, accounts, the installed app, the languages and a chart of 30, 90 or 365 days.
- **Without the page**, in Supabase: **SQL Editor → New query**, paste and **Run**:

  ```sql
  select day, dau as active_that_day, wau as last_7_days, mau as last_30_days,
         new_visitors, accounts_total, accounts_new
  from public.visit_days order by day desc limit 30;
  ```

| Table | What | Kept |
| --- | --- | --- |
| `visits` | one row per device per day: the device number, the language and the yes/no facts | 35 days |
| `visitors` | one row per device number: its first and last day, on how many days it came | for good |
| `visit_days` | the totals of each finished day (no device numbers) | for good |

None of the three can be read from the site; only the totals come out, through `site_stats()`.
