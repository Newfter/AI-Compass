/* =========================================================
   AI COMPASS — LAB: WHY YOUR FEED LOOKS LIKE THAT
   Two parts. "People like you": the learner likes videos, the app finds
   the viewers whose likes are most similar (cosine similarity) and
   recommends what they liked (user-based collaborative filtering).
   "The feed bubble": a simulated viewer with broad tastes gets a feed of
   5 videos per round; it can only watch what it is shown, and every watch
   makes that topic more likely to be shown again. Without "surprises"
   (exploration) the feed shrinks to one topic: a filter bubble.
   Texts and the videos: js/content/lab/recommend.js.

   Sections:
    1. Settings
    2. The maths (viewers, similarity, recommendations, the feed)
    3. The experiment (A.lab.define)
   ========================================================= */

(function () {
    "use strict";

    const A = window.AICompass;
    if (!A || !A.lab || !A.lab.define) return;

    const t = A.t;
    const kit = A.labKit;

    /* =========================================================
       1. SETTINGS
       ========================================================= */
    const VIEWERS = { seed: 2026, count: 30, main: 0.8, second: 0.55, other: 0.07, secondChance: 0.6 };
    const NEIGHBOURS = 5;                 // viewers used for the recommendations
    const SHOW_NEIGHBOURS = 3;            // viewers shown in the list
    const SHOW_RECS = 4;                  // recommendations shown
    const FEED = { slots: 5, power: 2, rounds: 60, window: 5, seed: 7 };
    const INTEREST = [0.3, 0.25, 0.2, 0.15, 0.1];   // the simulated viewer's real taste (shuffled per viewer)
    const EXPLORE = { min: 0, max: 0.6, step: 0.05, value: 0 };
    const SPEED = { watch: 3, fast: 20 }; // rounds per second
    const GOALS = { likes: 3, match: 0.7, bubble: 0.3, open: 0.5, openRounds: 40, openExplore: 0.3 };
    const SAVE_VERSION = 1;               // ctx.store "settings" = { v, part, explore }; "likes" = { v, ids }

    /* =========================================================
       2. THE MATHS
       ========================================================= */
    // 30 viewers: each loves one topic, often a second one, and now and then likes something else
    function makeViewers(videos, topics) {
        const random = kit.rng(VIEWERS.seed);
        const viewers = [];
        for (let i = 0; i < VIEWERS.count; i++) {
            const main = i % topics.length;
            let second = -1;
            if (random.next() < VIEWERS.secondChance) second = (main + 1 + random.int(topics.length - 1)) % topics.length;
            let likes = videos.map(function (video) {
                const topic = topics.indexOf(video[1]);
                const p = topic === main ? VIEWERS.main : topic === second ? VIEWERS.second : VIEWERS.other;
                return random.next() < p ? 1 : 0;
            });
            if (likes.reduce(function (a, b) { return a + b; }, 0) < 2) {
                likes = likes.map(function (like, v) { return topics.indexOf(videos[v][1]) === main ? 1 : like; });
            }
            viewers.push({ n: i + 1, likes: likes });
        }
        return viewers;
    }

    // Cosine similarity of two yes/no lists: shared likes / √(likes of one × likes of the other)
    function similarity(a, b) {
        let shared = 0;
        let na = 0;
        let nb = 0;
        for (let i = 0; i < a.length; i++) {
            shared += a[i] * b[i];
            na += a[i];
            nb += b[i];
        }
        return na && nb ? shared / Math.sqrt(na * nb) : 0;
    }

    // The viewers most like you, and the videos they liked that you haven't
    function recommend(you, viewers) {
        const ranked = viewers.map(function (viewer) { return { viewer: viewer, sim: similarity(you, viewer.likes) }; })
            .filter(function (x) { return x.sim > 0; })
            .sort(function (a, b) { return b.sim - a.sim || a.viewer.n - b.viewer.n; });
        const near = ranked.slice(0, NEIGHBOURS);
        const total = near.reduce(function (sum, x) { return sum + x.sim; }, 0);
        const recs = [];
        you.forEach(function (liked, v) {
            if (liked || !total) return;
            let score = 0;
            let count = 0;
            near.forEach(function (x) {
                if (x.viewer.likes[v]) {
                    score += x.sim;
                    count++;
                }
            });
            if (score > 0) recs.push({ video: v, score: score / total, count: count });
        });
        recs.sort(function (a, b) { return b.score - a.score || a.video - b.video; });
        return { near: ranked.slice(0, SHOW_NEIGHBOURS), recs: recs.slice(0, SHOW_RECS) };
    }

    function pickWeighted(random, weights) {
        const sum = weights.reduce(function (a, b) { return a + b; }, 0);
        let x = random.next() * sum;
        for (let i = 0; i < weights.length; i++) {
            x -= weights[i];
            if (x < 0) return i;
        }
        return weights.length - 1;
    }

    // Variety: how evenly the topics of the last feeds are spread (0: one topic, 1: all five equally)
    function variety(feeds, topics) {
        const items = [].concat.apply([], feeds);
        if (!items.length) return 1;
        const counts = new Array(topics).fill(0);
        items.forEach(function (topic) { counts[topic]++; });
        let h = 0;
        counts.forEach(function (n) {
            if (!n) return;
            const p = n / items.length;
            h -= p * Math.log(p);
        });
        return h / Math.log(topics);
    }

    // The feed: { random, interest, watches: per topic (start 1), feeds: [[topic x5]], picks, varieties }
    function newFeed(seed, topics) {
        const random = kit.rng(seed);
        return {
            seed: seed,
            random: random,
            interest: seed === FEED.seed ? INTEREST.slice() : random.shuffle(INTEREST.slice()),
            watches: new Array(topics).fill(1),
            feeds: [],
            videos: [],
            picks: [],
            varieties: []
        };
    }

    // One round: fill 5 places (a surprise or "more of what was watched"), watch one, learn from it
    function feedRound(feed, explore, topicCount, perTopic) {
        const random = feed.random;
        const weights = feed.watches.map(function (w) { return Math.pow(w, FEED.power); });
        const topics = [];
        for (let s = 0; s < FEED.slots; s++) {
            topics.push(random.next() < explore ? random.int(topicCount) : pickWeighted(random, weights));
        }
        const pick = pickWeighted(random, topics.map(function (topic) { return feed.interest[topic]; }));
        feed.watches[topics[pick]]++;
        feed.feeds.push(topics);
        feed.videos.push(topics.map(function (topic) { return topic * perTopic + random.int(perTopic); }));
        feed.picks.push(pick);
        feed.varieties.push(variety(feed.feeds.slice(-FEED.window), topicCount));
    }

    /* =========================================================
       3. THE EXPERIMENT
       ========================================================= */
    function make(tag, className, text) {
        const element = document.createElement(tag);
        if (className) element.className = className;
        if (text !== undefined) element.textContent = text;
        return element;
    }

    A.lab.define("recommend", {
        maths: { makeViewers: makeViewers, similarity: similarity, recommend: recommend, variety: variety, newFeed: newFeed, feedRound: feedRound },

        create: function (stage, ctx) {
            const data = A.content.get("lab.recommend");
            const topicIds = data.topics;
            const videos = data.videos;
            const perTopic = videos.length / topicIds.length;
            const viewers = makeViewers(videos, topicIds);

            const saved = ctx.store.get("settings", null, function (value) {
                return value.v === SAVE_VERSION && (value.part === "like" || value.part === "feed") &&
                    typeof value.explore === "number" && value.explore >= EXPLORE.min && value.explore <= EXPLORE.max;
            });
            const savedLikes = ctx.store.get("likes", null, function (value) {
                return value.v === SAVE_VERSION && Array.isArray(value.ids);
            });
            const you = videos.map(function (video) { return savedLikes && savedLikes.ids.indexOf(video[0]) !== -1 ? 1 : 0; });
            let part = saved ? saved.part : "like";
            let explore = saved ? saved.explore : EXPLORE.value;
            let feed = newFeed(FEED.seed, topicIds.length);
            let state = "ready";
            let resumeOnShow = false;
            let lastRecs = { near: [], recs: [] };

            const title = function (v) { return (data.titles[A.lang] || data.titles.en)[videos[v][0]]; };
            const topicName = function (index) { return t("lab.recommend.topic." + topicIds[index]); };
            const topicOf = function (v) { return topicIds.indexOf(videos[v][1]); };

            // ----- The page -----
            const ui = kit.layout(stage, { side: true });
            const partPicker = kit.segmented({
                labelKey: "lab.recommend.part",
                options: [{ value: "like", labelKey: "lab.recommend.partLike" }, { value: "feed", labelKey: "lab.recommend.partFeed" }],
                value: part,
                onChange: function (value) {
                    part = value;
                    if (part !== "feed") stopFeed();
                    save();
                    showPart();
                    render();
                }
            });
            ui.top.appendChild(partPicker.element);

            // Part 1: the videos, the neighbours, the recommendations
            const likeMain = make("div", "rc-part");
            const likeHelp = make("p", "rc-help");
            likeHelp.setAttribute("data-i18n", "lab.recommend.likeHelp");
            likeHelp.textContent = t("lab.recommend.likeHelp");
            const grid = make("ul", "rc-grid");
            const clearLikes = kit.button("lab.recommend.clearLikes", { icon: "trash", variant: "subtle", onClick: function () {
                you.fill(0);
                saveLikes();
                render();
            } });
            likeMain.appendChild(kit.group("lab.recommend.likeTitle", [likeHelp, grid, kit.toolbar([clearLikes])]));

            const likeSide = make("div", "rc-part");
            const nearList = make("ul", "rc-near");
            const recList = make("ul", "rc-recs");
            likeSide.append(kit.group("lab.recommend.neighboursTitle", [nearList]), kit.group("lab.recommend.recsTitle", [recList]));

            const tiles = videos.map(function (video, v) {
                const li = make("li");
                const button = make("button", "rc-video");
                button.type = "button";
                const emoji = make("span", "rc-emoji", video[2]);
                emoji.setAttribute("aria-hidden", "true");
                const name = make("span", "rc-video-title");
                const topic = make("span", "rc-video-topic");
                const heart = make("span", "rc-heart", "♥");
                heart.setAttribute("aria-hidden", "true");
                button.append(emoji, name, topic, heart);
                button.addEventListener("click", function () {
                    you[v] = you[v] ? 0 : 1;
                    saveLikes();
                    render();
                });
                li.appendChild(button);
                grid.appendChild(li);
                return { button: button, name: name, topic: topic };
            });

            // Part 2: the feed, the chart, the controls, the taste bars
            const feedMain = make("div", "rc-part");
            const feedTitle = make("h4", "rc-feed-title");
            const feedList = make("ul", "rc-feed");
            const chartView = kit.canvas(feedMain, { height: 160, labelKey: "lab.recommend.chart" });
            const chart = kit.lineChart(chartView, {
                series: [{ values: feed.varieties, colorIndex: 0, labelKey: "lab.recommend.chartVariety", fill: true }],
                yMin: 0,
                yMax: 1,
                x0: 1,
                format: function (v) { return A.format.percent(v); },
                xLabelKey: "lab.recommend.chartRound",
                yLabelKey: "lab.recommend.chartVariety"
            });
            feedMain.insertBefore(feedList, feedMain.firstChild);
            feedMain.insertBefore(feedTitle, feedList);

            const feedSide = make("div", "rc-part");
            const playButton = kit.button("lab.kit.play", { icon: "play", variant: "primary", onClick: togglePlay });
            const stepButton = kit.button("lab.kit.step", { icon: "step", onClick: stepOnce });
            const resetButton = kit.button("lab.kit.reset", { icon: "reset", onClick: function () { resetFeed(feed.seed); } });
            const newButton = kit.button("lab.recommend.newViewer", { icon: "dice", variant: "subtle", onClick: function () { resetFeed(kit.newSeed()); } });
            const status = kit.status("ready");
            const speed = kit.segmented({
                labelKey: "lab.kit.speed",
                options: [{ value: "watch", labelKey: "lab.kit.speedWatch" }, { value: "fast", labelKey: "lab.kit.speedFast" }],
                value: "watch",
                onChange: function (value) { loop.setRate(SPEED[value]); }
            });
            const exploreSlider = kit.slider({
                labelKey: "lab.recommend.explore", min: EXPLORE.min, max: EXPLORE.max, step: EXPLORE.step, value: explore,
                hintKey: "lab.recommend.exploreHint",
                format: function (v) { return A.format.percent(v); },
                onInput: function (value) { explore = value; },
                onChange: function (value) {
                    explore = value;
                    save();
                    render();
                }
            });
            explore = exploreSlider.value();
            const percent = function (v) { return A.format.percent(v); };
            const roundsStat = kit.stat({ labelKey: "lab.recommend.rounds", value: 0, format: function (v) { return A.format.number(v); } });
            const varietyStat = kit.stat({ labelKey: "lab.recommend.variety", format: percent, trend: "auto", better: "up" });
            const tasteBox = make("div");
            const shownBox = make("div");
            const tasteLabel = make("p", "rc-bars-title");
            tasteLabel.setAttribute("data-i18n", "lab.recommend.taste");
            tasteLabel.textContent = t("lab.recommend.taste");
            const shownLabel = make("p", "rc-bars-title");
            shownLabel.setAttribute("data-i18n", "lab.recommend.shown");
            shownLabel.textContent = t("lab.recommend.shown");
            const tasteBars = kit.bars(tasteBox, { items: [], max: 1, format: percent });
            const shownBars = kit.bars(shownBox, { items: [], max: 1, format: percent });
            feedSide.append(
                kit.toolbar([playButton, stepButton, resetButton, newButton, status]),
                speed.element,
                exploreSlider.element,
                kit.row([roundsStat, varietyStat], { grid: true }),
                kit.group("lab.recommend.tasteTitle", [tasteLabel, tasteBox, shownLabel, shownBox])
            );

            ui.main.append(likeMain, feedMain);
            ui.side.append(likeSide, feedSide);

            const idea = make("p", "rc-idea");
            const explain = kit.explain({ steps: [{ key: "lab.recommend.step1" }, { key: "lab.recommend.step2" }, { key: "lab.recommend.step3" }] });
            const challenges = kit.challenges({ ctx: ctx, items: [
                { key: "lab.recommend.ch1", insightKey: "lab.recommend.ch1Why", check: function (info) { return info.likes >= GOALS.likes && info.best >= GOALS.match; } },
                { key: "lab.recommend.ch2", insightKey: "lab.recommend.ch2Why", check: function (info) { return info.surprise; } },
                { key: "lab.recommend.ch3", insightKey: "lab.recommend.ch3Why", check: function (info) {
                    return info.rounds >= FEED.window && info.allZero && info.variety < GOALS.bubble;
                } },
                { key: "lab.recommend.ch4", insightKey: "lab.recommend.ch4Why", check: function (info) {
                    return info.rounds >= GOALS.openRounds && info.minExplore >= GOALS.openExplore - 1e-9 && info.variety > GOALS.open;
                } }
            ] });
            ui.bottom.append(idea, explain.element, challenges.element);

            // The lowest and highest surprise setting during this run (a challenge must hold for the whole run)
            let runExplore = null;

            const loop = kit.loop({ rate: SPEED.watch, update: takeRound, draw: render });
            chartView.onResize(function () { chart.draw(); });

            // ----- What the buttons do -----
            function save() {
                ctx.store.set("settings", { v: SAVE_VERSION, part: part, explore: explore });
            }

            function saveLikes() {
                ctx.store.set("likes", { v: SAVE_VERSION, ids: videos.filter(function (video, v) { return you[v]; }).map(function (video) { return video[0]; }) });
            }

            function takeRound() {
                if (!runExplore) runExplore = { min: explore, max: explore };
                runExplore.min = Math.min(runExplore.min, explore);
                runExplore.max = Math.max(runExplore.max, explore);
                feedRound(feed, explore, topicIds.length, perTopic);
                const n = feed.feeds.length;
                if (n >= FEED.rounds) finish();
                else if (state === "paused") {
                    const last = feed.videos[n - 1][feed.picks[n - 1]];
                    ctx.announce(t("lab.recommend.saidRound", { n: A.format.number(n), title: title(last), variety: percent(feed.varieties[n - 1]) }));
                }
            }

            function setState(next) {
                state = next;
                status.set(next);
                playButton.setLabel(next === "running" ? "lab.kit.pause" : "lab.kit.play");
                playButton.setIcon(next === "running" ? "pause" : "play");
                if (next === "done" && document.activeElement === stepButton.element) playButton.element.focus();
                stepButton.setDisabled(next === "done");
            }

            function finish() {
                loop.stop();
                setState("done");
                const v = feed.varieties[feed.varieties.length - 1];
                ctx.announce(t("lab.recommend.saidDone", { n: A.format.number(feed.feeds.length), variety: percent(v) }));
                ctx.track("milestone", { kind: "feed", explore: Math.round(explore * 100), variety: Math.round(v * 100) });
            }

            function togglePlay() {
                if (state === "running") {
                    loop.stop();
                    setState("paused");
                    return;
                }
                if (state === "done") resetFeed(feed.seed);
                setState("running");
                loop.start();
            }

            function stepOnce() {
                loop.stop();
                setState("paused");
                loop.step();
            }

            function stopFeed() {
                if (state === "running") {
                    loop.stop();
                    setState("paused");
                }
            }

            function resetFeed(seed) {
                loop.stop();
                feed = newFeed(seed, topicIds.length);
                chart.set({ series: [{ values: feed.varieties, colorIndex: 0, labelKey: "lab.recommend.chartVariety", fill: true }] });
                runExplore = null;
                setState("ready");
                render();
            }

            function showPart() {
                const like = part === "like";
                likeMain.hidden = !like;
                likeSide.hidden = !like;
                feedMain.hidden = like;
                feedSide.hidden = like;
            }

            // ----- Drawing -----
            function drawLikes() {
                tiles.forEach(function (tile, v) {
                    A.dom.setText(tile.name, title(v));
                    A.dom.setText(tile.topic, topicName(topicOf(v)));
                    tile.button.setAttribute("aria-pressed", String(Boolean(you[v])));
                    tile.button.setAttribute("aria-label", t("lab.recommend.likeLabel", { title: title(v), topic: topicName(topicOf(v)) }));
                    tile.button.style.setProperty("--rc-topic", "var(--lk-series-" + (topicOf(v) + 1) + ")");
                });
                const result = recommend(you, viewers);
                lastRecs = result;
                nearList.textContent = "";
                if (!result.near.length) nearList.appendChild(make("li", "rc-empty", t("lab.recommend.neighboursEmpty")));
                result.near.forEach(function (x) {
                    const li = make("li", "rc-viewer");
                    const head = make("div", "rc-viewer-head");
                    head.append(make("strong", "", t("lab.recommend.viewer", { n: A.format.number(x.viewer.n) })),
                        make("span", "rc-match", t("lab.recommend.match", { n: A.format.percent(x.sim) })));
                    const bar = make("span", "rc-match-bar");
                    bar.setAttribute("aria-hidden", "true");
                    const fill = make("span");
                    fill.style.width = (x.sim * 100).toFixed(1) + "%";
                    bar.appendChild(fill);
                    const emojis = [];
                    x.viewer.likes.forEach(function (like, v) { if (like && !you[v]) emojis.push(videos[v][2]); });
                    const also = make("span", "rc-also");
                    if (emojis.length) {
                        also.setAttribute("aria-hidden", "true");
                        also.textContent = emojis.join(" ");
                        const names = [];
                        x.viewer.likes.forEach(function (like, v) { if (like && !you[v]) names.push(title(v)); });
                        li.append(head, bar, also, make("span", "sr-only", t("lab.recommend.alsoLiked", { list: names.join(", ") })));
                    } else {
                        li.append(head, bar);
                    }
                    nearList.appendChild(li);
                });
                recList.textContent = "";
                if (!result.recs.length) recList.appendChild(make("li", "rc-empty", t("lab.recommend.recsEmpty")));
                const likedTopics = topicIds.map(function (id, topic) {
                    return you.some(function (like, v) { return like && topicOf(v) === topic; });
                });
                result.recs.forEach(function (rec) {
                    const li = make("li", "rc-rec");
                    const emoji = make("span", "rc-emoji", videos[rec.video][2]);
                    emoji.setAttribute("aria-hidden", "true");
                    const body = make("span", "rc-rec-body");
                    body.append(make("strong", "", title(rec.video)), make("span", "rc-because", A.plural("lab.recommend.because", rec.count)));
                    li.append(emoji, body);
                    if (!likedTopics[topicOf(rec.video)]) li.appendChild(make("span", "rc-surprise", t("lab.recommend.surprise")));
                    recList.appendChild(li);
                });
                return likedTopics;
            }

            function drawFeed() {
                const n = feed.feeds.length;
                A.dom.setText(feedTitle, n ? t("lab.recommend.feedTitle", { n: A.format.number(n) }) : t("lab.recommend.feedStart"));
                feedList.textContent = "";
                if (n) {
                    feed.videos[n - 1].forEach(function (v, slot) {
                        const li = make("li", "rc-card" + (slot === feed.picks[n - 1] ? " is-watched" : ""));
                        li.style.setProperty("--rc-topic", "var(--lk-series-" + (topicOf(v) + 1) + ")");
                        const emoji = make("span", "rc-emoji", videos[v][2]);
                        emoji.setAttribute("aria-hidden", "true");
                        li.append(emoji, make("span", "rc-card-title", title(v)), make("span", "rc-video-topic", topicName(topicOf(v))));
                        if (slot === feed.picks[n - 1]) li.appendChild(make("span", "rc-watched", t("lab.recommend.watched")));
                        feedList.appendChild(li);
                    });
                }
                chart.draw();
                roundsStat.set(n);
                varietyStat.set(n ? feed.varieties[n - 1] : null);
                tasteBars.update(topicIds.map(function (id, topic) {
                    return { label: topicName(topic), value: feed.interest[topic], colorIndex: topic };
                }), { max: 1 });
                const recent = [].concat.apply([], feed.feeds.slice(-FEED.window));
                shownBars.update(topicIds.map(function (id, topic) {
                    const count = recent.filter(function (x) { return x === topic; }).length;
                    return { label: topicName(topic), value: recent.length ? count / recent.length : 0, colorIndex: topic };
                }), { max: 1 });
                chartView.describe(t("lab.recommend.describe", {
                    n: A.format.number(n),
                    variety: percent(n ? feed.varieties[n - 1] : 1),
                    explore: percent(explore)
                }));
            }

            function render() {
                const likedTopics = drawLikes();
                drawFeed();
                const n = feed.feeds.length;
                const likes = you.reduce(function (a, b) { return a + b; }, 0);
                const best = lastRecs.near.length ? lastRecs.near[0].sim : 0;
                const v = n ? feed.varieties[n - 1] : 1;
                idea.innerHTML = A.i18nHTML("lab.recommend.ideaLine") + " ";
                idea.append(kit.termLink("recommendation", "lab.recommend.term"), ".");
                explain.setValues(0, { n: A.format.number(likes) });
                explain.setValues(1, { best: best ? A.format.percent(best) : "—" });
                explain.setValues(2, { variety: percent(v) });
                explain.setStep(part === "feed" ? 2 : likes ? 1 : 0);
                explain.setText(part === "feed" && n >= FEED.window && v < GOALS.bubble ? "lab.recommend.noteBubble" : part === "like" ? "lab.recommend.noteLike" : null);
                challenges.check({
                    likes: likes,
                    best: best,
                    surprise: lastRecs.recs.some(function (rec) { return !likedTopics[topicOf(rec.video)]; }) && likes > 0,
                    rounds: n,
                    variety: v,
                    allZero: Boolean(runExplore) && runExplore.max === 0,
                    minExplore: runExplore ? runExplore.min : 0
                });
            }

            showPart();
            render();

            // ----- The controller: the hub calls these -----
            return {
                pause: function () {
                    resumeOnShow = loop.running();
                    loop.stop();
                },
                resume: function () {
                    if (resumeOnShow && state === "running") loop.start();
                    resumeOnShow = false;
                },
                language: function () {
                    kit.relabel(stage);
                    render();
                },
                theme: function () {
                    kit.colors.invalidate();
                    render();
                },
                destroy: function () {
                    loop.stop();
                    chartView.destroy();
                }
            };
        }
    });
})();
