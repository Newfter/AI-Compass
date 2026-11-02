-- AI Compass: accounts, cloud progress and the Knowledge Challenge
-- =================================================================
-- Run this whole file once in the SQL editor of your Supabase project (see
-- docs/ACCOUNTS-SETUP.md, step 5). Running it again is safe: it only creates what is
-- missing and refreshes the functions.
--
-- What it builds:
--   profiles             one row per signed-in person: a public nickname, never the e-mail
--   challenge_questions  the question bank WITH the right answers (never readable by the browser)
--   challenge_attempts   every Knowledge Challenge attempt, timed and scored on the server
--   user_progress        the learner's saved progress, one row per saved key, own rows only
--   events               a diary of learning results (lesson finished, quiz result ...), own rows only
-- and the functions the website calls: begin_attempt, submit_attempt, challenge_board,
-- my_stats, my_profile, set_nickname, delete_my_account, ping.
--
-- Security model, in one paragraph: the browser only ever holds the public "anon" key.
-- Every table has row level security, so a signed-in person can read and write their own
-- rows of user_progress and events and nothing else. The question bank, the attempts and
-- the profiles are not readable directly at all; the website reaches them only through the
-- functions below, which run as the database owner ("security definer"), check who is
-- calling with auth.uid(), and give back only what that person may see. Scores and times
-- are computed here, from the server clock, never trusted from the browser. The right answers
-- are shown only after a round that counts, a new round can start once a minute, and a diary
-- cannot grow faster than a person learns.

create schema if not exists private;
revoke all on schema private from public;

-- Supabase gives every new table and function in "public" to the browser roles by default.
-- From here on, anything created in this schema starts out unreachable instead, and only the
-- grants at the end of this file open what the website needs.
alter default privileges in schema public revoke all on tables from anon, authenticated;
alter default privileges in schema public revoke all on sequences from anon, authenticated;
alter default privileges in schema public revoke all on functions from anon, authenticated;

-- ---------------------------------------------------------------------------------
-- The rules of the challenge, in one place. The website reads them from the server.
-- ---------------------------------------------------------------------------------
create or replace function private.rules() returns jsonb
language sql immutable as $$
  select jsonb_build_object(
    'questions', 20,        -- questions per attempt
    'per_lesson', 2,        -- at most this many from one lesson (when the bank allows)
    'limit_minutes', 60,    -- an attempt not finished in time is over and does not count
    'min_seconds', 60,      -- faster than this cannot be an honest read of 20 questions
    'cooldown_seconds', 60, -- a new attempt may start this long after the previous one began
    'board_size', 100       -- rows shown on a leaderboard
  )
$$;

-- ---------------------------------------------------------------------------------
-- 1. Profiles
-- ---------------------------------------------------------------------------------
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  nickname text not null check (char_length(nickname) between 3 and 20),
  nickname_chosen boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.profiles enable row level security;
revoke all on public.profiles from anon, authenticated;

-- Letters that look like Latin ones (a Cyrillic "а", a Greek "ο") become that Latin letter,
-- so that "Аlex" cannot pose as "Alex". Lower case, in the plain (NFKC) Unicode form.
create or replace function private.fold_lookalikes(name text) returns text
language sql immutable as $$
  select translate(lower(normalize(coalesce(name, ''), nfkc)),
    'аеорсухіјѕԁԛѡһӏкмнвтгзαβεζηικμνορτυχγω',
    'aeopcyxijsdqwhlkmhbtr3abeznikmvoptyxyw')
$$;

-- Two nicknames are the same name when they look the same: case, look-alike letters, a capital
-- I for an l, a 0 for an o, a 1 for an l and the separators (space _ . -) make no difference.
create or replace function private.nickname_key(name text) returns text
language sql immutable as $$
  select regexp_replace(
    translate(private.fold_lookalikes(translate(normalize(coalesce(name, ''), nfkc), 'I', 'l')), '01', 'ol'),
    '[ _.-]', '', 'g')
$$;
drop index if exists public.profiles_nickname_lower;
create unique index if not exists profiles_nickname_key on public.profiles (private.nickname_key(nickname));

-- A neutral starting nickname ("Explorer 4821"), never built from the e-mail or the name.
create or replace function private.new_nickname() returns text
language plpgsql as $$
declare
  n text;
  tries int := 0;
begin
  loop
    n := 'Explorer ' || (1000 + floor(random() * 9000))::int;
    exit when not exists (select 1 from public.profiles where private.nickname_key(nickname) = private.nickname_key(n));
    tries := tries + 1;
    if tries > 40 then
      n := 'Explorer ' || (100000 + floor(random() * 900000))::int;
      exit;
    end if;
  end loop;
  return n;
end $$;

-- Cleans a nickname typed by the person. Returns null when it cannot be used.
create or replace function private.clean_nickname(raw text) returns text
language plpgsql immutable as $$
declare
  -- the alphabets a nickname may use (one of them, not a mix: mixing is how look-alike names are made)
  latin     constant text := 'A-Za-z\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u024F';
  cyrillic  constant text := '\u0400-\u0481\u048A-\u04FF';
  greek     constant text := '\u0370-\u03FF';
  armenian  constant text := '\u0531-\u0556\u0561-\u0587';
  hebrew    constant text := '\u05D0-\u05EA';
  arabic    constant text := '\u0620-\u064A\u0671-\u06D3';
  georgian  constant text := '\u10A0-\u10FF';
  indic     constant text := '\u0900-\u097F';
  thai      constant text := '\u0E00-\u0E7F';
  east_asia constant text := '\u3040-\u30FF\u3400-\u4DBF\u4E00-\u9FFF\uAC00-\uD7AF';
  letters   constant text := latin || cyrillic || greek || armenian || hebrew || arabic || georgian || indic || thai || east_asia;
  alphabet  text;
  alphabets int := 0;
  n text := normalize(coalesce(raw, ''), nfkc);   -- full-width and decorated letters become plain ones
  low text;
begin
  -- invisible characters (zero-width spaces, direction marks, fillers) are removed
  n := regexp_replace(n, '[\u00AD\u034F\u061C\u115F\u1160\u17B4\u17B5\u180B-\u180E\u200B-\u200F\u202A-\u202E\u2060-\u206F\u3164\uFE00-\uFE0F\uFEFF\uFFA0\uFFF0-\uFFF8]', '', 'g');
  n := btrim(regexp_replace(n, '\s+', ' ', 'g'));
  -- letters, digits, spaces, _ . -   (3 to 20 characters, starting with a letter or digit)
  if n !~ ('^[' || letters || '0-9][' || letters || '0-9 _.-]{2,19}$') then return null; end if;
  foreach alphabet in array array[latin, cyrillic, greek, armenian, hebrew, arabic, georgian, indic, thai, east_asia] loop
    if n ~ ('[' || alphabet || ']') then alphabets := alphabets + 1; end if;
  end loop;
  if alphabets > 1 then return null; end if;
  -- nothing that sounds official: also with look-alike letters, digits for letters (Supp0rt),
  -- separators (Admin., A d m i n) or endings (admin1, Moderater) added
  low := regexp_replace(lower(n), '[ _.-]+', ' ', 'g');
  if low ~ '\m(админ|модер|поддержк|владел|систем|официал)' then return null; end if;
  low := translate(private.fold_lookalikes(low), '013457', 'oieast');
  if low ~ '(\m(admin|moder|support|staff|official|owner|system|ai ?compass)|\mroot\M)'
     or regexp_replace(low, ' ', '', 'g') ~ '^(admin|moder|support|staff|official|owner|system|aicompass|root$)' then
    return null;
  end if;
  return n;
end $$;

-- Runs when Google sign-in creates a new user: the profile appears at once.
create or replace function public.handle_new_user() returns trigger
language plpgsql security definer set search_path = '' as $$
begin
  insert into public.profiles (id, nickname) values (new.id, private.new_nickname())
  on conflict (id) do nothing;
  return new;
end $$;
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ---------------------------------------------------------------------------------
-- 2. The question bank (private: the browser never reads this table)
-- ---------------------------------------------------------------------------------
create table if not exists public.challenge_questions (
  id text primary key check (id ~ '^c[0-9]{2}-[0-9]{2}$'),
  lesson smallint not null check (lesson between 1 and 99),
  topic text not null default '',
  difficulty smallint not null default 1 check (difficulty between 1 and 3),
  en jsonb not null,
  ru jsonb not null,
  answer smallint not null check (answer between 0 and 3),
  source jsonb not null default '{}'::jsonb,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  constraint challenge_questions_en_shape check (
    jsonb_typeof(en -> 'text') = 'string' and jsonb_typeof(en -> 'explanation') = 'string'
    and jsonb_typeof(en -> 'options') = 'array' and jsonb_array_length(en -> 'options') = 4),
  constraint challenge_questions_ru_shape check (
    jsonb_typeof(ru -> 'text') = 'string' and jsonb_typeof(ru -> 'explanation') = 'string'
    and jsonb_typeof(ru -> 'options') = 'array' and jsonb_array_length(ru -> 'options') = 4)
);
alter table public.challenge_questions enable row level security;
revoke all on public.challenge_questions from anon, authenticated;

-- ---------------------------------------------------------------------------------
-- 3. Attempts (private: reached only through begin_attempt / submit_attempt / my_stats)
-- ---------------------------------------------------------------------------------
create table if not exists public.challenge_attempts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  question_ids text[] not null,
  shuffles jsonb not null,          -- per question, the order in which the options were shown
  answers jsonb,                    -- per question, the position the player chose (null = none)
  lang text not null default 'en' check (lang in ('en', 'ru')),
  status text not null default 'started' check (status in ('started', 'completed', 'abandoned', 'expired')),
  started_at timestamptz not null default now(),
  finished_at timestamptz,
  duration_ms integer check (duration_ms is null or duration_ms >= 0),
  correct smallint check (correct is null or correct >= 0),
  total smallint not null check (total > 0),
  eligible boolean not null default false     -- counts for the leaderboards
);
create index if not exists challenge_attempts_user on public.challenge_attempts (user_id, started_at desc);
create index if not exists challenge_attempts_board on public.challenge_attempts (finished_at)
  where status = 'completed' and eligible;
alter table public.challenge_attempts enable row level security;
revoke all on public.challenge_attempts from anon, authenticated;

-- ---------------------------------------------------------------------------------
-- 4. Saved progress: one row per saved key, mirrored from the browser
-- ---------------------------------------------------------------------------------
create table if not exists public.user_progress (
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  key text not null check (key ~ '^[a-z][a-z0-9._-]{0,63}$'),
  value jsonb not null,
  updated_at timestamptz not null default now(),
  primary key (user_id, key),
  constraint user_progress_size check (pg_column_size(value) <= 262144)
);
alter table public.user_progress enable row level security;
revoke all on public.user_progress from anon, authenticated;
grant select, insert, update, delete on public.user_progress to authenticated;
drop policy if exists "progress: own rows" on public.user_progress;
create policy "progress: own rows" on public.user_progress
  for all to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

create or replace function private.touch_updated_at() returns trigger
language plpgsql as $$
begin
  new.updated_at := now();
  return new;
end $$;
drop trigger if exists user_progress_touch on public.user_progress;
create trigger user_progress_touch
  before insert or update on public.user_progress
  for each row execute function private.touch_updated_at();

-- The website saves a few dozen keys per person; a hundred is already not the website.
create or replace function private.cap_progress_keys() returns trigger
language plpgsql as $$
begin
  if not exists (select 1 from public.user_progress where user_id = new.user_id and key = new.key)
     and (select count(*) from public.user_progress where user_id = new.user_id) >= 100 then
    raise exception 'too_many_keys';
  end if;
  return new;
end $$;
drop trigger if exists user_progress_cap on public.user_progress;
create trigger user_progress_cap
  before insert on public.user_progress
  for each row execute function private.cap_progress_keys();

-- ---------------------------------------------------------------------------------
-- 5. Events: the diary of learning results shown in My Compass
-- ---------------------------------------------------------------------------------
create table if not exists public.events (
  id bigint generated always as identity primary key,
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  type text not null check (type in (
    'lesson.complete', 'lesson.check', 'quiz.finish', 'daily.complete', 'certificate.make',
    'lab.use', 'lab.challenge', 'flashcard.finish', 'timeline.era')),
  detail jsonb not null default '{}'::jsonb check (pg_column_size(detail) <= 2048),
  at timestamptz not null default now(),
  recorded_at timestamptz not null default now()
);
create index if not exists events_user_time on public.events (user_id, at desc);
alter table public.events enable row level security;
revoke all on public.events from anon, authenticated;
grant select, insert on public.events to authenticated;
drop policy if exists "events: read own" on public.events;
create policy "events: read own" on public.events for select to authenticated using (user_id = auth.uid());
drop policy if exists "events: add own" on public.events;
create policy "events: add own" on public.events for insert to authenticated with check (user_id = auth.uid());

-- An event may carry the time it happened (offline, for example), but never a time in the
-- future, and nothing from before the website existed.
create or replace function private.clamp_event_time() returns trigger
language plpgsql as $$
begin
  new.at := greatest(least(coalesce(new.at, now()), now()), timestamptz '2025-01-01');
  new.recorded_at := now();
  return new;
end $$;
drop trigger if exists events_clamp_time on public.events;
create trigger events_clamp_time
  before insert on public.events
  for each row execute function private.clamp_event_time();

-- A diary grows at the pace of learning: more than this per minute or per day is a script.
create index if not exists events_user_recorded on public.events (user_id, recorded_at desc);
create or replace function private.cap_events() returns trigger
language plpgsql as $$
declare
  last_minute int;
  last_day int;
begin
  select count(*) filter (where recorded_at > now() - interval '1 minute'), count(*)
    into last_minute, last_day
    from public.events where user_id = new.user_id and recorded_at > now() - interval '1 day';
  if last_minute >= 150 or last_day >= 2000 then raise exception 'too_many_events'; end if;
  return new;
end $$;
drop trigger if exists events_cap on public.events;
create trigger events_cap
  before insert on public.events
  for each row execute function private.cap_events();

-- ---------------------------------------------------------------------------------
-- 6. Helpers (private schema: not reachable from outside)
-- ---------------------------------------------------------------------------------

-- Monday 00:00 UTC of the current week: the weekly leaderboard starts here.
create or replace function private.week_start() returns timestamptz
language sql stable as $$
  select (date_trunc('week', now() at time zone 'utc')) at time zone 'utc'
$$;

-- The best counting attempt of every player since a moment (null = all time).
create or replace function private.bests(since timestamptz)
returns table (user_id uuid, attempt_id uuid, correct smallint, duration_ms integer, finished_at timestamptz)
language sql stable as $$
  select distinct on (a.user_id) a.user_id, a.id, a.correct, a.duration_ms, a.finished_at
  from public.challenge_attempts a
  where a.status = 'completed' and a.eligible
    and (since is null or a.finished_at >= since)
  order by a.user_id, a.correct desc, a.duration_ms asc, a.finished_at asc
$$;

-- Where one player stands: { position, players } or null when they have no counting attempt.
create or replace function private.standing(who uuid, since timestamptz) returns jsonb
language sql stable as $$
  with ranked as (
    select b.user_id, rank() over (order by b.correct desc, b.duration_ms asc) as position,
           count(*) over () as players
    from private.bests(since) b
  )
  select jsonb_build_object('position', r.position, 'players', r.players)
  from ranked r where r.user_id = who
$$;

create or replace function private.attempt_summary(a public.challenge_attempts) returns jsonb
language sql immutable as $$
  select jsonb_build_object(
    'id', a.id, 'status', a.status, 'started_at', a.started_at, 'finished_at', a.finished_at,
    'correct', a.correct, 'total', a.total, 'duration_ms', a.duration_ms, 'eligible', a.eligible)
$$;

-- The option (0-3) a player chose for question idx, or null for no answer or anything odd
-- (a fraction, a huge number, a text ...).
create or replace function private.answer_at(answers jsonb, idx int) returns int
language plpgsql immutable as $$
declare
  v numeric;
begin
  if answers is null or jsonb_typeof(answers -> idx) <> 'number' then return null; end if;
  v := (answers ->> idx)::numeric;
  if v <> floor(v) or v < 0 or v > 3 then return null; end if;
  return v::int;
exception when others then
  return null;
end $$;

-- The marked attempt, question by question, in the order and option order the player saw.
create or replace function private.review(a public.challenge_attempts, lang text) returns jsonb
language plpgsql stable as $$
declare
  l text := case when lang = 'ru' then 'ru' else 'en' end;
  i int;
  q public.challenge_questions;
  perm int[];
  picked int;
  items jsonb := '[]'::jsonb;
begin
  for i in 1 .. a.total loop
    select * into q from public.challenge_questions where id = a.question_ids[i];
    if not found then continue; end if;
    select array_agg(x::int order by ord) into perm
      from jsonb_array_elements_text(a.shuffles -> (i - 1)) with ordinality as t(x, ord);
    picked := private.answer_at(a.answers, i - 1);
    items := items || jsonb_build_object(
      'id', q.id,
      'lesson', q.lesson,
      'text', (case when l = 'ru' then q.ru else q.en end) -> 'text',
      'options', (select jsonb_agg((case when l = 'ru' then q.ru else q.en end) -> 'options' -> perm[k] order by k)
                  from generate_subscripts(perm, 1) k),
      'picked', picked,
      'correct', array_position(perm, q.answer::int) - 1,
      'explanation', (case when l = 'ru' then q.ru else q.en end) -> 'explanation');
  end loop;
  return items;
end $$;

-- The result of a finished attempt. The review (right answers and explanations) is part of it
-- only when the attempt counts: a round rushed through in seconds does not reveal the answers.
create or replace function private.result(a public.challenge_attempts, lang text) returns jsonb
language sql stable as $$
  select private.attempt_summary(a)
    || jsonb_build_object('rules', private.rules())
    || case when a.eligible then jsonb_build_object('review', private.review(a, lang)) else '{}'::jsonb end
$$;

revoke all on all functions in schema private from public, anon, authenticated;

-- ---------------------------------------------------------------------------------
-- 7. What the website calls
-- ---------------------------------------------------------------------------------

-- Keeps a free project awake (called daily by the GitHub Action) and tells the time.
create or replace function public.ping() returns jsonb
language sql stable as $$
  select jsonb_build_object('ok', true, 'time', now())
$$;

-- The caller's profile; creates it when it is missing.
create or replace function public.my_profile() returns jsonb
language plpgsql security definer set search_path = '' as $$
declare
  uid uuid := auth.uid();
  p public.profiles;
begin
  if uid is null then raise exception 'not_signed_in'; end if;
  select * into p from public.profiles where id = uid;
  if not found then
    insert into public.profiles (id, nickname) values (uid, private.new_nickname()) on conflict (id) do nothing;
    select * into p from public.profiles where id = uid;
  end if;
  return jsonb_build_object('id', p.id, 'nickname', p.nickname, 'nickname_chosen', p.nickname_chosen,
                            'created_at', p.created_at);
end $$;

-- Chooses the public nickname. Errors: not_signed_in, nickname_invalid, nickname_taken.
create or replace function public.set_nickname(name text) returns jsonb
language plpgsql security definer set search_path = '' as $$
declare
  uid uuid := auth.uid();
  n text;
begin
  if uid is null then raise exception 'not_signed_in'; end if;
  n := private.clean_nickname(name);
  if n is null then raise exception 'nickname_invalid'; end if;
  begin
    insert into public.profiles (id, nickname, nickname_chosen) values (uid, n, true)
    on conflict (id) do update set nickname = excluded.nickname, nickname_chosen = true, updated_at = now();
  exception when unique_violation then
    raise exception 'nickname_taken';
  end;
  return jsonb_build_object('nickname', n, 'nickname_chosen', true);
end $$;

-- Starts an attempt: picks the questions, shuffles them and their options, starts the clock.
-- Any earlier unfinished attempt of the caller is marked abandoned. The answers stay here.
-- Errors: not_signed_in, bank_too_small, too_soon (the hint says how many seconds to wait).
create or replace function public.begin_attempt(lang text default 'en') returns jsonb
language plpgsql security definer set search_path = '' as $$
declare
  uid uuid := auth.uid();
  l text := case when lang = 'ru' then 'ru' else 'en' end;
  rules jsonb := private.rules();
  n int := (rules ->> 'questions')::int;
  per_lesson int := (rules ->> 'per_lesson')::int;
  ids text[];
  qid text;
  q public.challenge_questions;
  perm int[];
  shuffles jsonb := '[]'::jsonb;
  questions jsonb := '[]'::jsonb;
  a public.challenge_attempts;
  last_start timestamptz;
  wait int;
begin
  if uid is null then raise exception 'not_signed_in'; end if;

  -- one new round per minute, counted from the start of the previous one: a real player never
  -- notices (a round takes longer), a script that starts rounds non-stop to copy the bank does
  select max(started_at) into last_start from public.challenge_attempts where user_id = uid;
  wait := ceil(extract(epoch from (last_start + make_interval(secs => (rules ->> 'cooldown_seconds')::int) - now())));
  if wait > 0 then raise exception 'too_soon' using hint = wait::text; end if;

  update public.challenge_attempts set status = 'abandoned', finished_at = now()
   where user_id = uid and status = 'started';

  -- a few questions from every lesson first, then random ones until there are enough
  with ranked as (
    select id, row_number() over (partition by lesson order by random()) as rn, random() as r
    from public.challenge_questions where active
  ), picked as (
    select id from ranked order by (rn <= per_lesson) desc, r limit n
  )
  select array_agg(id order by random()) into ids from picked;
  if ids is null or cardinality(ids) < n then raise exception 'bank_too_small'; end if;

  foreach qid in array ids loop
    select * into q from public.challenge_questions where id = qid;
    select array_agg(x order by random()) into perm from generate_series(0, 3) x;
    shuffles := shuffles || jsonb_build_array(to_jsonb(perm));  -- one list per question
    questions := questions || jsonb_build_object(
      'id', q.id,
      'lesson', q.lesson,
      'text', (case when l = 'ru' then q.ru else q.en end) -> 'text',
      'options', (select jsonb_agg((case when l = 'ru' then q.ru else q.en end) -> 'options' -> perm[k] order by k)
                  from generate_subscripts(perm, 1) k));
  end loop;

  insert into public.challenge_attempts (user_id, question_ids, shuffles, total, lang)
  values (uid, ids, shuffles, n, l) returning * into a;

  return jsonb_build_object(
    'attempt', jsonb_build_object(
      'id', a.id, 'started_at', a.started_at, 'total', a.total,
      'expires_at', a.started_at + make_interval(mins => (rules ->> 'limit_minutes')::int)),
    'questions', questions,
    'rules', rules);
end $$;

-- Finishes an attempt: marks it on the server clock, saves it, and returns the result. The
-- full review with the right answers and explanations is included only when the attempt counts
-- (finished in time, not rushed). Sending the same attempt again returns the same result (so a
-- lost connection cannot double-count). Errors: not_signed_in, attempt_not_found, bad_answers.
-- An attempt over the time limit comes back with status 'expired'.
create or replace function public.submit_attempt(attempt_id uuid, answers jsonb, lang text default null)
returns jsonb
language plpgsql security definer set search_path = '' as $$
declare
  uid uuid := auth.uid();
  a public.challenge_attempts;
  rules jsonb := private.rules();
  l text;
  i int;
  pos int;
  shown_order int[];
  q_answer int;
  n_correct int := 0;
  clean jsonb := '[]'::jsonb;
  ms bigint;
  previous record;
  result jsonb;
begin
  if uid is null then raise exception 'not_signed_in'; end if;
  select * into a from public.challenge_attempts where id = attempt_id and user_id = uid for update;
  if not found then raise exception 'attempt_not_found'; end if;
  l := coalesce(nullif(lang, ''), a.lang);

  if a.status = 'completed' then
    return private.result(a, l) || jsonb_build_object('repeated', true);
  end if;
  if a.status <> 'started' then
    return private.attempt_summary(a) || jsonb_build_object('rules', rules);
  end if;

  ms := floor(extract(epoch from (now() - a.started_at)) * 1000);
  if ms > (rules ->> 'limit_minutes')::int * 60000 then
    update public.challenge_attempts set status = 'expired', finished_at = now()
     where id = a.id returning * into a;
    return private.attempt_summary(a) || jsonb_build_object('rules', rules);
  end if;

  if answers is null or jsonb_typeof(answers) <> 'array' or jsonb_array_length(answers) <> a.total then
    raise exception 'bad_answers';
  end if;

  for i in 1 .. a.total loop
    pos := private.answer_at(answers, i - 1);
    clean := clean || coalesce(to_jsonb(pos), 'null'::jsonb);
    if pos is not null then
      select array_agg(x::int order by ord) into shown_order
        from jsonb_array_elements_text(a.shuffles -> (i - 1)) with ordinality as t(x, ord);
      select answer into q_answer from public.challenge_questions where id = a.question_ids[i];
      if shown_order[pos + 1] = q_answer then n_correct := n_correct + 1; end if;
    end if;
  end loop;

  -- the player's best counting attempt before this one
  select b.correct, b.duration_ms into previous from private.bests(null) b where b.user_id = uid;

  update public.challenge_attempts
     set status = 'completed', finished_at = now(), duration_ms = ms, correct = n_correct,
         answers = clean, eligible = (ms >= (rules ->> 'min_seconds')::int * 1000)
   where id = a.id returning * into a;

  result := private.result(a, l);
  return result || jsonb_build_object(
    'new_best', a.eligible and (previous is null or previous.correct is null
                 or a.correct > previous.correct
                 or (a.correct = previous.correct and a.duration_ms < previous.duration_ms)),
    'standing', jsonb_build_object(
      'all', private.standing(uid, null),
      'week', private.standing(uid, private.week_start())));
end $$;

-- The leaderboard: period 'all' or 'week'. Public: nicknames only, never e-mail addresses.
create or replace function public.challenge_board(period text default 'all') returns jsonb
language plpgsql security definer set search_path = '' stable as $$
declare
  uid uuid := auth.uid();
  since timestamptz := case when period = 'week' then private.week_start() else null end;
  rules jsonb := private.rules();
  rows_json jsonb;
  me jsonb;
  players int;
begin
  with ranked as (
    select b.user_id, b.correct, b.duration_ms, b.finished_at,
           rank() over (order by b.correct desc, b.duration_ms asc) as position,
           row_number() over (order by b.correct desc, b.duration_ms asc, b.finished_at asc) as rn
    from private.bests(since) b
  ), named as (
    select r.*, coalesce(p.nickname, 'Explorer') as nickname from ranked r
    left join public.profiles p on p.id = r.user_id
  )
  select count(*),
         coalesce(jsonb_agg(jsonb_build_object(
           'position', position, 'nickname', nickname, 'correct', correct,
           'duration_ms', duration_ms, 'finished_at', finished_at,
           'me', uid is not null and user_id = uid) order by rn)
           filter (where rn <= (rules ->> 'board_size')::int), '[]'::jsonb),
         (jsonb_agg(jsonb_build_object(
           'position', position, 'nickname', nickname, 'correct', correct,
           'duration_ms', duration_ms, 'finished_at', finished_at, 'me', true))
           filter (where uid is not null and user_id = uid)) -> 0
    into players, rows_json, me
  from named;

  return jsonb_build_object(
    'period', case when since is null then 'all' else 'week' end,
    'since', since,
    'players', players,
    'rows', rows_json,
    'me', me,
    'rules', rules,
    'updated_at', now());
end $$;

-- Everything My Compass shows a signed-in person about their challenge results.
create or replace function public.my_stats() returns jsonb
language plpgsql security definer set search_path = '' stable as $$
declare
  uid uuid := auth.uid();
  p public.profiles;
  best public.challenge_attempts;
  week_best public.challenge_attempts;
  recent jsonb;
  n_completed int;
  n_eligible int;
begin
  if uid is null then raise exception 'not_signed_in'; end if;
  select * into p from public.profiles where id = uid;

  select a.* into best from public.challenge_attempts a
   where a.user_id = uid and a.status = 'completed' and a.eligible
   order by a.correct desc, a.duration_ms asc, a.finished_at asc limit 1;
  select a.* into week_best from public.challenge_attempts a
   where a.user_id = uid and a.status = 'completed' and a.eligible and a.finished_at >= private.week_start()
   order by a.correct desc, a.duration_ms asc, a.finished_at asc limit 1;
  select count(*) filter (where status = 'completed'), count(*) filter (where status = 'completed' and eligible)
    into n_completed, n_eligible from public.challenge_attempts where user_id = uid;
  select coalesce(jsonb_agg(private.attempt_summary(a) order by a.started_at desc), '[]'::jsonb) into recent
    from (select * from public.challenge_attempts where user_id = uid and status <> 'started'
          order by started_at desc limit 20) a;

  return jsonb_build_object(
    'profile', case when p.id is null then null else jsonb_build_object(
      'nickname', p.nickname, 'nickname_chosen', p.nickname_chosen, 'created_at', p.created_at) end,
    'attempts', jsonb_build_object('completed', n_completed, 'eligible', n_eligible),
    'best', case when best.id is null then null else private.attempt_summary(best) end,
    'week_best', case when week_best.id is null then null else private.attempt_summary(week_best) end,
    'standing', jsonb_build_object(
      'all', private.standing(uid, null),
      'week', private.standing(uid, private.week_start())),
    'week_start', private.week_start(),
    'recent', recent,
    'rules', private.rules());
end $$;

-- Deletes the caller's account and everything saved with it.
create or replace function public.delete_my_account() returns void
language plpgsql security definer set search_path = '' as $$
declare
  uid uuid := auth.uid();
begin
  if uid is null then raise exception 'not_signed_in'; end if;
  delete from auth.users where id = uid;
end $$;

-- Who may call what. Everything else in public is not callable from outside.
revoke all on all sequences in schema public from anon, authenticated;
revoke execute on function public.handle_new_user() from public, anon, authenticated;
revoke execute on function public.my_profile(), public.set_nickname(text), public.begin_attempt(text),
  public.submit_attempt(uuid, jsonb, text), public.my_stats(), public.delete_my_account()
  from public, anon;
grant execute on function public.my_profile(), public.set_nickname(text), public.begin_attempt(text),
  public.submit_attempt(uuid, jsonb, text), public.my_stats(), public.delete_my_account()
  to authenticated;
grant execute on function public.challenge_board(text), public.ping() to anon, authenticated;
