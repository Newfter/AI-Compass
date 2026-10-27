/* =========================================================
   AI COMPASS — LESSONS
   Six interactive lessons. This file builds:
   1. a progress panel (ring, lesson map, continue / reset)
   2. a grid of lesson cards
   3. a full-screen lesson reader with a mini-lab, key ideas,
      a "check yourself" question and previous / next buttons
   4. a downloadable certificate when every lesson is done
   It also adds "Open lesson" commands to the Ctrl+K palette
   and window.AICompass.openLesson(number) for other features.
   ========================================================= */

(function () {
    "use strict";

    const A = window.AICompass;
    const mount = document.querySelector('[data-feature="lessons"]');
    if (!A || !mount) return;

    const t = A.t;
    const esc = A.escapeHTML;
    const READER_ID = "lesson-reader";     // the reader's name among the pop-up windows (A.overlays)

    // ---------- 1. The six lessons ----------
    // The texts live in the translations below (keys "lessons.l1.title", ...).
    // rgb: which accent colour the lesson uses. lab: which mini-lab it shows.
    // correct: index (0, 1 or 2) of the right answer to "Check yourself".
    // notes: which sections have a small highlighted box, and its type.
    const LESSONS = [
        {
            number: 1, icon: "🤖", level: "beginner", minutes: 4, rgb: "--accent-rgb",
            sections: 4, notes: { 1: "fact", 2: "example" }, lab: "sort", correct: 1,
            tryIt: "timeline", tryIcon: "🕰️",
            keywords: "what is ai artificial intelligence basics что такое ии искусственный интеллект основы"
        },
        {
            number: 2, icon: "📊", level: "beginner", minutes: 5, rgb: "--accent-2-rgb",
            sections: 4, notes: { 2: "tip" }, lab: "fit", correct: 2,
            tryIt: "classifier", tryIcon: "🧪",
            keywords: "machine learning training data model машинное обучение данные модель"
        },
        {
            number: 3, icon: "🧠", level: "intermediate", minutes: 6, rgb: "--accent-3-rgb",
            sections: 4, notes: { 3: "example" }, lab: "neuron", correct: 0,
            tryIt: "classifier", tryIcon: "🧪",
            keywords: "neural networks neuron deep learning нейронные сети нейрон глубокое обучение нейросеть"
        },
        {
            number: 4, icon: "💬", level: "intermediate", minutes: 6, rgb: "--accent-rgb",
            sections: 4, notes: { 3: "example" }, lab: "words", correct: 2,
            tryIt: "predictor", tryIcon: "🔮",
            keywords: "generative ai chatbots llm chatgpt генеративный ии чат-боты чатбот языковая модель"
        },
        {
            number: 5, icon: "📱", level: "beginner", minutes: 4, rgb: "--accent-2-rgb",
            sections: 4, notes: { 1: "fact" }, lab: "day", correct: 1,
            tryIt: "glossary", tryIcon: "📖",
            keywords: "everyday life phone recommendations повседневная жизнь телефон рекомендации"
        },
        {
            number: 6, icon: "⚖️", level: "intermediate", minutes: 5, rgb: "--accent-3-rgb",
            sections: 4, notes: { 2: "tip" }, lab: "dilemmas", correct: 0,
            tryIt: "quiz", tryIcon: "🏆",
            keywords: "ethics safety bias deepfakes privacy этика безопасность предвзятость дипфейки приватность"
        }
    ];

    const TOTAL = LESSONS.length;

    // Every text (English and Russian) is in js/content/lessons.js

    // ---------- 10. Small helpers ----------

    // 3 -> "03"
    function pad(n) {
        return String(n).padStart(2, "0");
    }

    function lessonKey(n, part) {
        return "lessons.l" + n + "." + part;
    }

    function lessonTitle(n) {
        return t(lessonKey(n, "title"));
    }

    // Redraws a part of the page from scratch, but keeps the keyboard focus on
    // the "same" button afterwards (buttons are matched by data-fid).
    function redraw(box, html) {
        const active = document.activeElement;
        const fid = active && box.contains(active) ? active.getAttribute("data-fid") : null;
        box.innerHTML = html;
        if (fid) {
            const again = box.querySelector('[data-fid="' + fid + '"]');
            if (again) again.focus({ preventScroll: true });
        }
    }

    // ---------- 11. Saved progress ----------
    const savedCompleted = A.storage.get("lessons.completed", []);
    const completed = new Set(
        (Array.isArray(savedCompleted) ? savedCompleted : []).filter(function (n) {
            return Number.isInteger(n) && n >= 1 && n <= TOTAL;
        })
    );

    const checkAnswers = {};   // lesson number -> chosen option (this visit only)
    const labState = {};       // lesson number -> state of its mini-lab

    function saveCompleted() {
        A.storage.set("lessons.completed", Array.from(completed).sort(function (a, b) { return a - b; }));
    }

    // The first lesson that is not completed yet (0 when all are done)
    function nextLesson() {
        for (let n = 1; n <= TOTAL; n++) {
            if (!completed.has(n)) return n;
        }
        return 0;
    }

    // ---------- 12. Progress panel + cards (built once) ----------
    function cardHTML(lesson) {
        const n = lesson.number;
        return `
            <article class="lsn-card card" id="lesson-card-${n}" data-lesson="${n}" data-reveal data-tilt style="--lsn-rgb: var(${lesson.rgb});">
                <span class="lsn-card-glow" aria-hidden="true"></span>
                <div class="lsn-card-top">
                    <span class="lsn-card-num" aria-hidden="true">${pad(n)}</span>
                    <span class="lsn-badge mono" data-ref="badge" hidden></span>
                </div>
                <div class="lsn-card-icon" aria-hidden="true">
                    <span>${lesson.icon}</span>
                    <span class="lsn-card-tick">✓</span>
                </div>
                <h3 class="lsn-card-title" data-i18n="lessons.l${n}.title">${lessonTitle(n)}</h3>
                <p class="lsn-card-desc" data-i18n="lessons.l${n}.desc">${t(lessonKey(n, "desc"))}</p>
                <div class="lsn-card-meta">
                    <span class="chip lsn-level lsn-level-${lesson.level}">
                        <span class="lsn-dot" aria-hidden="true"></span>
                        <span data-i18n="lessons.level.${lesson.level}">${t("lessons.level." + lesson.level)}</span>
                    </span>
                    <span class="chip"><span aria-hidden="true">⏱</span><span data-ref="minutes"></span></span>
                </div>
                <button type="button" class="btn btn-ghost btn-small lsn-card-open" data-open="${n}">
                    <span data-ref="openText"></span>
                    <span class="lsn-arrow" aria-hidden="true">→</span>
                </button>
            </article>`;
    }

    mount.innerHTML = `
        <div class="lsn-hud card" data-reveal>
            <span class="lsn-hud-corners" aria-hidden="true"></span>
            <div class="lsn-ring" aria-hidden="true">
                <svg class="lsn-ring-ticks" viewBox="0 0 100 100" focusable="false">
                    <circle cx="50" cy="50" r="48" transform="rotate(-90 50 50)"></circle>
                </svg>
                <svg class="lsn-ring-chart" viewBox="0 0 100 100" focusable="false">
                    <defs>
                        <linearGradient id="lsn-ring-gradient" x1="0" y1="0" x2="1" y2="1">
                            <stop offset="0" class="lsn-stop-a"></stop>
                            <stop offset="1" class="lsn-stop-b"></stop>
                        </linearGradient>
                    </defs>
                    <circle class="lsn-ring-track" cx="50" cy="50" r="40" pathLength="100"></circle>
                    <circle class="lsn-ring-fill" cx="50" cy="50" r="40" pathLength="100" data-ref="ringFill"></circle>
                </svg>
                <span class="lsn-ring-value"><span data-ref="percent">0</span><small>%</small></span>
            </div>
            <div class="lsn-hud-info">
                <p class="lsn-hud-label mono" data-i18n="lessons.hud.label">${t("lessons.hud.label")}</p>
                <p class="lsn-hud-count" data-ref="count"></p>
                <p class="lsn-hud-sub" data-ref="sub"></p>
            </div>
            <div class="lsn-hud-actions">
                <button type="button" class="btn btn-primary btn-small" data-ref="continue"></button>
                <button type="button" class="btn btn-primary btn-small lsn-cert-toggle" data-ref="certToggle" aria-expanded="false" aria-controls="lsn-cert" hidden>
                    <span aria-hidden="true">🏆</span>
                    <span data-i18n="lessons.cert.button">${t("lessons.cert.button")}</span>
                </button>
                <button type="button" class="btn btn-ghost btn-small lsn-reset" data-ref="reset"></button>
            </div>
            <ol class="lsn-path" data-ref="path"></ol>
            <p class="sr-only" aria-live="polite" data-ref="live"></p>
        </div>

        <section class="lsn-cert card" id="lsn-cert" aria-labelledby="lsn-cert-title" hidden>
            <div class="lsn-cert-form">
                <p class="lsn-hud-label mono">🏆 AI Compass</p>
                <h3 class="lsn-cert-title" id="lsn-cert-title" data-i18n="lessons.cert.title">${t("lessons.cert.title")}</h3>
                <p class="lsn-cert-intro" data-i18n="lessons.cert.intro">${t("lessons.cert.intro")}</p>
                <label class="lsn-field-label" for="lsn-cert-name" data-i18n="lessons.cert.nameLabel">${t("lessons.cert.nameLabel")}</label>
                <input class="lsn-input" id="lsn-cert-name" type="text" maxlength="40" autocomplete="name" spellcheck="false"
                       data-i18n-attr="placeholder:lessons.cert.placeholder" placeholder="${esc(t("lessons.cert.placeholder"))}">
                <button type="button" class="btn btn-primary" data-ref="certDownload">
                    <span aria-hidden="true">⬇</span>
                    <span data-i18n="lessons.cert.download">${t("lessons.cert.download")}</span>
                </button>
            </div>
            <div class="lsn-cert-preview">
                <canvas width="1600" height="1100" role="img" data-ref="certCanvas"></canvas>
            </div>
        </section>

        <div class="lsn-grid">${LESSONS.map(cardHTML).join("")}</div>
    `;

    function ref(root, name) {
        return root.querySelector('[data-ref="' + name + '"]');
    }

    const hud = {
        root: mount.querySelector(".lsn-hud"),
        ringFill: ref(mount, "ringFill"),
        percent: ref(mount, "percent"),
        count: ref(mount, "count"),
        sub: ref(mount, "sub"),
        continueButton: ref(mount, "continue"),
        certToggle: ref(mount, "certToggle"),
        reset: ref(mount, "reset"),
        path: ref(mount, "path"),
        live: ref(mount, "live")
    };

    const cert = {
        root: mount.querySelector(".lsn-cert"),
        input: mount.querySelector("#lsn-cert-name"),
        download: ref(mount, "certDownload"),
        canvas: ref(mount, "certCanvas")
    };

    const grid = mount.querySelector(".lsn-grid");
    const cards = Array.prototype.slice.call(grid.querySelectorAll(".lsn-card"));

    // The lesson map: one round button per lesson, joined by glowing lines
    hud.path.innerHTML = LESSONS.map(function (lesson) {
        return `
            <li class="lsn-step" data-step="${lesson.number}">
                <button type="button" class="lsn-node" data-open="${lesson.number}">
                    <span class="lsn-node-num" aria-hidden="true">${lesson.number}</span>
                    <span class="lsn-node-check" aria-hidden="true">✓</span>
                </button>
                <span class="lsn-step-label" aria-hidden="true" data-i18n="lessons.l${lesson.number}.title">${lessonTitle(lesson.number)}</span>
            </li>`;
    }).join("");

    const steps = Array.prototype.slice.call(hud.path.querySelectorAll(".lsn-step"));

    // ---------- 13. Updating the panel and the cards ----------
    let ringValue = 0;
    let ringFrame = 0;
    let ringStarted = false;
    let resetArmed = false;
    let resetTimer = 0;

    // Animates the percentage in the middle of the ring
    function setRing(target) {
        cancelAnimationFrame(ringFrame);
        hud.ringFill.style.strokeDashoffset = String(100 - target);
        if (!A.motion.ok()) {
            ringValue = target;
            hud.percent.textContent = String(target);
            return;
        }
        const from = ringValue;
        const start = performance.now();
        function step(now) {
            const progress = Math.min(1, (now - start) / 900);
            const eased = 1 - Math.pow(1 - progress, 3);
            ringValue = Math.round(from + (target - from) * eased);
            hud.percent.textContent = String(ringValue);
            if (progress < 1) ringFrame = requestAnimationFrame(step);
        }
        ringFrame = requestAnimationFrame(step);
    }

    function updateHUD() {
        const done = completed.size;
        const next = nextLesson();
        const percent = Math.round((done / TOTAL) * 100);

        hud.root.classList.toggle("is-complete", done === TOTAL);
        hud.count.textContent = A.plural("lessons.hud.count", done, { total: TOTAL });
        hud.sub.textContent = done === TOTAL
            ? t("lessons.hud.allDone")
            : A.plural("lessons.hud.left", TOTAL - done) + " · " + t("lessons.hud.upNext", { title: lessonTitle(next) });

        // Buttons
        hud.continueButton.hidden = done === TOTAL;
        hud.continueButton.innerHTML = esc(done === 0 ? t("lessons.hud.start") : t("lessons.hud.continue", { n: next })) +
            ' <span class="lsn-arrow" aria-hidden="true">→</span>';
        hud.certToggle.hidden = done !== TOTAL;
        if (done !== TOTAL) toggleCertificate(false);
        hud.reset.hidden = done === 0;
        hud.reset.classList.toggle("is-armed", resetArmed);
        hud.reset.textContent = (resetArmed ? "⚠ " : "↺ ") + t(resetArmed ? "lessons.hud.resetConfirm" : "lessons.hud.reset");

        // The lesson map
        hud.path.setAttribute("aria-label", t("lessons.hud.pathLabel"));
        steps.forEach(function (step, index) {
            const n = index + 1;
            const isDone = completed.has(n);
            step.classList.toggle("is-done", isDone);
            step.classList.toggle("is-next", n === next);
            step.classList.toggle("is-linked", isDone && completed.has(n - 1));
            const node = step.querySelector(".lsn-node");
            node.setAttribute("aria-label", t(isDone ? "lessons.hud.nodeDone" : "lessons.hud.nodeTodo", { n: n, title: lessonTitle(n) }));
            node.title = lessonTitle(n);
        });

        if (ringStarted) setRing(percent);
    }

    function updateCards() {
        const next = nextLesson();
        cards.forEach(function (card) {
            const n = Number(card.getAttribute("data-lesson"));
            const lesson = LESSONS[n - 1];
            const isDone = completed.has(n);
            const isNext = n === next;
            card.classList.toggle("is-done", isDone);
            card.classList.toggle("is-next", isNext);

            const badge = ref(card, "badge");
            badge.hidden = !isDone && !isNext;
            badge.textContent = isDone ? "✓ " + t("lessons.card.done") : t("lessons.card.next");

            ref(card, "minutes").textContent = t("lessons.card.minutes", { n: lesson.minutes });
            ref(card, "openText").textContent = t(isDone ? "lessons.card.review" : "lessons.card.open");
            card.querySelector("[data-open]").setAttribute("aria-label",
                t(isDone ? "lessons.card.reviewLabel" : "lessons.card.openLabel", { n: n, title: lessonTitle(n) }));
        });
    }

    function updateProgress() {
        updateHUD();
        updateCards();
        if (reader.open) updateReaderChrome();
    }

    // The ring counts up the first time the panel comes into view
    let stopRingWatch = null;
    stopRingWatch = A.whenVisible(hud.root, function (visible) {
        if (!visible || ringStarted) return;
        ringStarted = true;
        setRing(Math.round((completed.size / TOTAL) * 100));
        if (stopRingWatch) stopRingWatch();
    }, { threshold: 0.3 });

    // The decorative loops (ring ticks, glowing lines...) pause while the lessons are
    // off screen (whenVisible sets data-paused then) and while the reader covers them
    let mountVisible = true;
    let readerCovers = false;

    function updatePaused() {
        mount.toggleAttribute("data-paused", !mountVisible || readerCovers);
    }

    A.whenVisible(mount, function (visible) {
        mountVisible = visible;
        updatePaused();
    }, { pauseAnimations: true });

    A.overlays.onChange(function (detail) {
        readerCovers = detail.open.indexOf(READER_ID) !== -1;
        updatePaused();
    });

    // ---------- 14. Completing lessons ----------
    function setCompleted(n, isDone) {
        const before = completed.size;
        if (isDone) completed.add(n);
        else completed.delete(n);
        saveCompleted();
        updateProgress();

        if (!isDone) {
            A.toast(t("lessons.toast.undone"), "↩️");
            return;
        }
        // The very last lesson gets one big message instead of two small ones
        if (completed.size === TOTAL && before < TOTAL) {
            if (A.effects) A.effects.confetti();   // two bursts from the bottom corners
            A.toast(A.plural("lessons.toast.all", TOTAL), "🏆");
        } else {
            A.toast(t("lessons.toast.done", { title: lessonTitle(n) }), "✅");
        }
    }

    // Reset needs two presses, so progress is not lost by accident
    function onResetClick(event) {
        if (!resetArmed) {
            resetArmed = true;
            updateHUD();
            A.announce(t("lessons.hud.resetAsk"), { region: hud.live });
            clearTimeout(resetTimer);
            resetTimer = setTimeout(function () {
                resetArmed = false;
                updateHUD();
            }, 4000);
            return;
        }
        // The second click of a double-click (or a double tap) is not a second press
        if (event.detail > 1) return;
        clearTimeout(resetTimer);
        resetArmed = false;
        completed.clear();
        saveCompleted();
        Object.keys(checkAnswers).forEach(function (key) { delete checkAnswers[key]; });
        Object.keys(labState).forEach(function (key) { delete labState[key]; });
        updateProgress();
        A.toast(t("lessons.toast.reset"), "↺");
        hud.continueButton.focus();
    }

    // ---------- 16. The certificate ----------
    const CERT_ICON_STEP = 190;   // distance between the lesson icons on the certificate (canvas pixels)
    let certFrame = 0;

    function toggleCertificate(force) {
        const show = typeof force === "boolean" ? force : cert.root.hidden;
        if (show && completed.size !== TOTAL) return;
        cert.root.hidden = !show;
        hud.certToggle.setAttribute("aria-expanded", String(show));
        if (show) {
            drawCertificate();
            cert.root.scrollIntoView({ behavior: A.motion.ok() ? "smooth" : "auto", block: "nearest" });
        }
    }

    function scheduleCertificate() {
        if (cert.root.hidden) return;
        cancelAnimationFrame(certFrame);
        certFrame = requestAnimationFrame(drawCertificate);
    }

    // Writes text and makes the font smaller until it fits the given width
    function fitText(ctx, text, x, y, maxWidth, weight, size, family) {
        let fontSize = size;
        ctx.font = weight + " " + fontSize + "px " + family;
        while (ctx.measureText(text).width > maxWidth && fontSize > 12) {
            fontSize -= 2;
            ctx.font = weight + " " + fontSize + "px " + family;
        }
        ctx.fillText(text, x, y);
    }

    // Splits text into lines that are each at most maxWidth wide
    function splitLines(ctx, text, maxWidth) {
        const lines = [];
        let line = "";
        text.split(" ").forEach(function (word) {
            const test = line ? line + " " + word : word;
            if (ctx.measureText(test).width > maxWidth && line) {
                lines.push(line);
                line = word;
            } else {
                line = test;
            }
        });
        lines.push(line);
        return lines;
    }

    // Writes text on two centred lines. If it needs more lines, the font gets
    // a little smaller until it fits (no words are ever cut off).
    function wrapText(ctx, text, x, y, maxWidth, weight, size, family) {
        let fontSize = size;
        let lines;
        do {
            ctx.font = weight + " " + fontSize + "px " + family;
            lines = splitLines(ctx, text, maxWidth);
            fontSize -= 1;
        } while (lines.length > 2 && fontSize >= 14);
        const lineHeight = Math.round((fontSize + 1) * 1.28);
        lines.forEach(function (line, index) {
            ctx.fillText(line, x, y + index * lineHeight);
        });
    }

    function drawCertificate() {
        const canvas = cert.canvas;
        const ctx = canvas.getContext("2d");
        const W = canvas.width;
        const H = canvas.height;
        // The theme's colours (a canvas can't use CSS variables): rgba(name, alpha)
        const rgba = function (name, alpha) {
            return A.colors.rgba(A.colors.rgb(name), alpha === undefined ? 1 : alpha);
        };
        const color = {
            bg: rgba("--bg"),
            text: rgba("--text"),
            muted: rgba("--text-muted"),
            accent: rgba("--accent"),
            accent2: rgba("--accent-2"),
            success: rgba("--success")
        };
        const fonts = {
            display: A.cssVar("--font-display") || "sans-serif",
            body: A.cssVar("--font-body") || "sans-serif",
            mono: A.cssVar("--font-mono") || "monospace"
        };
        const name = cert.input.value.trim() || t("lessons.cert.defaultName");
        const gradient = ctx.createLinearGradient(0, 0, W, H);
        gradient.addColorStop(0, color.accent);
        gradient.addColorStop(1, color.accent2);

        ctx.save();
        ctx.clearRect(0, 0, W, H);
        ctx.textAlign = "center";
        ctx.textBaseline = "alphabetic";

        // Background with two soft glows and a fine grid
        ctx.fillStyle = color.bg;
        ctx.fillRect(0, 0, W, H);
        let glow = ctx.createRadialGradient(260, 160, 0, 260, 160, 900);
        glow.addColorStop(0, rgba("--accent", 0.3));
        glow.addColorStop(1, rgba("--accent", 0));
        ctx.fillStyle = glow;
        ctx.fillRect(0, 0, W, H);
        glow = ctx.createRadialGradient(W - 220, H - 160, 0, W - 220, H - 160, 800);
        glow.addColorStop(0, rgba("--accent-2", 0.2));
        glow.addColorStop(1, rgba("--accent-2", 0));
        ctx.fillStyle = glow;
        ctx.fillRect(0, 0, W, H);

        ctx.strokeStyle = rgba("--accent", 0.07);
        ctx.lineWidth = 1;
        for (let x = 0; x <= W; x += 40) {
            ctx.beginPath();
            ctx.moveTo(x, 0);
            ctx.lineTo(x, H);
            ctx.stroke();
        }
        for (let y = 0; y <= H; y += 40) {
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(W, y);
            ctx.stroke();
        }

        // Frames and corner brackets
        A.canvas.roundRect(ctx, 36, 36, W - 72, H - 72, 40);
        ctx.strokeStyle = gradient;
        ctx.lineWidth = 4;
        ctx.stroke();
        A.canvas.roundRect(ctx, 60, 60, W - 120, H - 120, 28);
        ctx.strokeStyle = rgba("--accent-2", 0.25);
        ctx.lineWidth = 1.5;
        ctx.stroke();
        ctx.strokeStyle = color.accent2;
        ctx.lineWidth = 5;
        [[84, 84, 1, 1], [W - 84, 84, -1, 1], [84, H - 84, 1, -1], [W - 84, H - 84, -1, -1]].forEach(function (c) {
            ctx.beginPath();
            ctx.moveTo(c[0], c[1] + 56 * c[3]);
            ctx.lineTo(c[0], c[1]);
            ctx.lineTo(c[0] + 56 * c[2], c[1]);
            ctx.stroke();
        });

        // Brand and heading
        ctx.fillStyle = color.accent2;
        ctx.font = "600 30px " + fonts.mono;
        if ("letterSpacing" in ctx) ctx.letterSpacing = "8px";
        ctx.fillText("🧭 AI COMPASS", W / 2, 168);
        if ("letterSpacing" in ctx) ctx.letterSpacing = "2px";
        ctx.fillStyle = gradient;
        fitText(ctx, t("lessons.cert.heading").toUpperCase(), W / 2, 268, 1280, "700", 58, fonts.display);
        if ("letterSpacing" in ctx) ctx.letterSpacing = "0px";

        // The name, with a glow
        ctx.save();
        ctx.shadowColor = rgba("--accent", 0.55);
        ctx.shadowBlur = 36;
        ctx.fillStyle = color.text;
        fitText(ctx, name, W / 2, 448, 1240, "700", 100, fonts.display);
        ctx.restore();
        const line = ctx.createLinearGradient(W / 2 - 380, 0, W / 2 + 380, 0);
        line.addColorStop(0, rgba("--accent-2", 0));
        line.addColorStop(0.5, color.accent2);
        line.addColorStop(1, rgba("--accent", 0));
        ctx.fillStyle = line;
        ctx.fillRect(W / 2 - 380, 492, 760, 3);

        // "for completing all six lessons": the number as a word when the texts have one
        const countWord = "lessons.cert.count." + TOTAL;
        ctx.fillStyle = color.muted;
        fitText(ctx, A.plural("lessons.cert.for", TOTAL, A.has(countWord) ? { n: t(countWord) } : null),
            W / 2, 566, 1240, "500", 34, fonts.body);

        // Every lesson with a check mark, in one row around the middle
        LESSONS.forEach(function (lesson, index) {
            const x = W / 2 + (index - (TOTAL - 1) / 2) * CERT_ICON_STEP;
            const y = 700;
            ctx.beginPath();
            ctx.arc(x, y, 54, 0, Math.PI * 2);
            ctx.fillStyle = rgba("--accent", 0.14);
            ctx.fill();
            ctx.strokeStyle = gradient;
            ctx.lineWidth = 3;
            ctx.stroke();
            ctx.font = "46px " + fonts.body;
            ctx.textBaseline = "middle";
            ctx.fillStyle = color.text;
            ctx.fillText(lesson.icon, x, y + 3);
            ctx.beginPath();
            ctx.arc(x + 40, y - 40, 17, 0, Math.PI * 2);
            ctx.fillStyle = color.success;
            ctx.fill();
            ctx.fillStyle = color.bg;
            ctx.font = "700 20px " + fonts.body;
            ctx.fillText("✓", x + 40, y - 39);
            ctx.textBaseline = "alphabetic";
            ctx.fillStyle = color.muted;
            wrapText(ctx, lessonTitle(lesson.number), x, y + 92, 176, "600", 19, fonts.body);
        });

        // Date and seal
        const date = A.format.date(new Date());
        ctx.textAlign = "left";
        ctx.fillStyle = color.muted;
        ctx.font = "500 26px " + fonts.mono;
        ctx.fillText(t("lessons.cert.date", { date: date }), 132, H - 128);

        // The round "6/6" seal (lessons done / all lessons) sits low enough to leave space under the lesson names
        const sealX = W - 220;
        const sealY = H - 168;
        ctx.textAlign = "center";
        ctx.beginPath();
        ctx.arc(sealX, sealY, 78, 0, Math.PI * 2);
        ctx.fillStyle = rgba("--accent-2", 0.1);
        ctx.fill();
        ctx.strokeStyle = gradient;
        ctx.lineWidth = 4;
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(sealX, sealY, 65, 0, Math.PI * 2);
        ctx.setLineDash([4, 8]);
        ctx.strokeStyle = color.accent2;
        ctx.lineWidth = 2;
        ctx.stroke();
        ctx.setLineDash([]);
        ctx.fillStyle = gradient;
        ctx.font = "700 40px " + fonts.display;
        ctx.fillText(completed.size + "/" + TOTAL, sealX, sealY + 7);
        ctx.fillStyle = color.muted;
        fitText(ctx, A.plural("lessons.cert.lessons", TOTAL).toUpperCase(), sealX, sealY + 36, 100, "600", 16, fonts.mono);
        ctx.restore();

        canvas.setAttribute("aria-label", t("lessons.cert.preview", { name: name }));
    }

    function downloadCertificate() {
        drawCertificate();
        function save(url, isBlob) {
            const link = document.createElement("a");
            link.href = url;
            link.download = "ai-compass-certificate.png";
            document.body.appendChild(link);
            link.click();
            link.remove();
            if (isBlob) setTimeout(function () { URL.revokeObjectURL(url); }, 4000);
            A.toast(t("lessons.toast.cert"), "🏆");
        }
        try {
            if (cert.canvas.toBlob) {
                cert.canvas.toBlob(function (blob) {
                    if (blob) save(URL.createObjectURL(blob), true);
                    else save(cert.canvas.toDataURL("image/png"), false);
                }, "image/png");
            } else {
                save(cert.canvas.toDataURL("image/png"), false);
            }
        } catch (error) {}
    }

    // The saved name: only a text, and never longer than the box allows (maxlength)
    const savedName = A.storage.get("lessons.certName", "");
    cert.input.value = typeof savedName === "string" ? savedName.slice(0, cert.input.maxLength) : "";
    cert.input.addEventListener("input", function () {
        A.storage.set("lessons.certName", cert.input.value);
        scheduleCertificate();
    });
    cert.download.addEventListener("click", downloadCertificate);

    // ---------- 17. Clicks on the panel and the cards ----------
    hud.root.addEventListener("click", function (event) {
        const node = event.target.closest("[data-open]");
        if (node) {
            openLesson(Number(node.getAttribute("data-open")), node);
            return;
        }
        if (event.target.closest('[data-ref="continue"]')) {
            openLesson(nextLesson() || 1, hud.continueButton);
        } else if (event.target.closest('[data-ref="certToggle"]')) {
            toggleCertificate();
        } else if (event.target.closest('[data-ref="reset"]')) {
            onResetClick(event);
        }
    });

    // Holding Enter down on a button repeats its click: on Reset only a new press counts
    hud.reset.addEventListener("keydown", function (event) {
        if (event.repeat && event.key === "Enter") event.preventDefault();
    });

    // A click anywhere on a card opens it (the button is the keyboard way in)
    grid.addEventListener("click", function (event) {
        const card = event.target.closest(".lsn-card");
        if (!card) return;
        const selection = window.getSelection ? String(window.getSelection()) : "";
        if (selection && !event.target.closest("button")) return;   // the user is selecting text
        openLesson(Number(card.getAttribute("data-lesson")), card.querySelector("[data-open]"));
    });

    // A soft coloured light follows the mouse over a card (the CSS draws it at --mx / --my).
    // Like the glare of effects.js, it only follows a real mouse, and only while
    // animations are on. The card's place on the page is read once, when the mouse
    // comes onto it, and --mx / --my are written at most once per frame.
    const finePointer = A.media(A.queries.finePointer);
    const cardLight = { card: null, left: 0, top: 0, x: 0, y: 0, frame: 0 };

    function cardLightOn() {
        return A.motion.ok() && finePointer.matches;
    }

    function lightCard(card) {
        const box = card.getBoundingClientRect();
        cardLight.card = card;
        cardLight.left = box.left + window.scrollX;   // page coordinates: still right after a scroll
        cardLight.top = box.top + window.scrollY;
    }

    function drawCardLight() {
        cardLight.frame = 0;
        const card = cardLight.card;
        if (!card) return;
        card.style.setProperty("--mx", Math.round(cardLight.x + window.scrollX - cardLight.left) + "px");
        card.style.setProperty("--my", Math.round(cardLight.y + window.scrollY - cardLight.top) + "px");
    }

    function followPointer(card, event) {
        if (event.pointerType !== "mouse" || !cardLightOn()) return;
        if (cardLight.card !== card) lightCard(card);
        cardLight.x = event.clientX;
        cardLight.y = event.clientY;
        if (!cardLight.frame) cardLight.frame = requestAnimationFrame(drawCardLight);
    }

    // Motion off (or no mouse any more): the light goes back to its resting place
    function resetCardLight() {
        cancelAnimationFrame(cardLight.frame);
        cardLight.frame = 0;
        cardLight.card = null;
        cards.forEach(function (card) {
            card.style.removeProperty("--mx");
            card.style.removeProperty("--my");
        });
    }

    cards.forEach(function (card) {
        card.addEventListener("pointerenter", function (event) {
            if (event.pointerType === "mouse" && cardLightOn()) lightCard(card);
            followPointer(card, event);
        });
        card.addEventListener("pointermove", function (event) { followPointer(card, event); });
        card.addEventListener("pointerleave", function () {
            if (cardLight.card === card) cardLight.card = null;
        });
    });

    A.motion.onChange(function () { if (!cardLightOn()) resetCardLight(); });
    A.onMedia(A.queries.finePointer, function () { if (!cardLightOn()) resetCardLight(); }, { immediate: false });

    // ---------- 18. Mini-lab 1: AI or not AI? ----------
    const SORT_ANSWERS = ["not", "ai", "ai", "not", "ai"];

    // Every mini-lab gets a view (redrawn) and a hidden live region (for screen readers)
    function labShell(box) {
        box.innerHTML = '<div class="lsn-lab-view"></div><p class="sr-only" aria-live="polite"></p>';
        return { view: box.firstElementChild, live: box.lastElementChild };
    }

    function mountSortLab(box, state) {
        const shell = labShell(box);

        function choiceButton(index, value, pick) {
            const label = value === "ai" ? "🤖 " + t("lessons.w1.ai") : "⚙️ " + t("lessons.w1.not");
            return `<button type="button" class="lsn-pill" data-sort="${value}" data-i="${index}" data-fid="w1-${index}-${value}"
                        aria-pressed="${pick === value}"${pick ? ' aria-disabled="true"' : ""}>${label}</button>`;
        }

        function draw() {
            let score = 0;
            let answered = 0;
            const rows = SORT_ANSWERS.map(function (answer, index) {
                const pick = state.answers[index];
                const isRight = pick === answer;
                if (pick) {
                    answered += 1;
                    if (isRight) score += 1;
                }
                const stateClass = pick ? (isRight ? "is-right" : "is-wrong") : "";
                const feedback = pick
                    ? `<p class="lsn-sort-feedback"><strong>${isRight ? "✓ " + t("lessons.w1.right") : "✗ " + t("lessons.w1.wrong")}</strong> ${t("lessons.w1.e" + (index + 1))}</p>`
                    : "";
                return `
                    <li class="lsn-sort-item ${stateClass}">
                        <p class="lsn-sort-text" id="lsn-sort-${index}">${t("lessons.w1.i" + (index + 1))}</p>
                        <div class="lsn-sort-buttons" role="group" aria-labelledby="lsn-sort-${index}">
                            ${choiceButton(index, "ai", pick)}
                            ${choiceButton(index, "not", pick)}
                        </div>
                        ${feedback}
                    </li>`;
            }).join("");

            let summary = t("lessons.w1.score", { score: score, total: SORT_ANSWERS.length });
            if (answered === SORT_ANSWERS.length) {
                summary += " — " + t(score === SORT_ANSWERS.length ? "lessons.w1.perfect" : "lessons.w1.good");
            }
            redraw(shell.view, `
                <ol class="lsn-sort">${rows}</ol>
                <div class="lsn-lab-foot">
                    <p class="lsn-lab-score">${summary}</p>
                    ${answered ? `<button type="button" class="btn btn-ghost btn-small" data-lab="reset" data-fid="w1-reset">↺ ${t("lessons.w1.reset")}</button>` : ""}
                </div>`);
        }

        box.onclick = function (event) {
            const button = event.target.closest("[data-sort]");
            if (button) {
                const index = Number(button.getAttribute("data-i"));
                if (state.answers[index]) return;
                state.answers[index] = button.getAttribute("data-sort");
                draw();
                const isRight = state.answers[index] === SORT_ANSWERS[index];
                A.announce(t(isRight ? "lessons.w1.right" : "lessons.w1.wrong") + " " + t("lessons.w1.e" + (index + 1)), { region: shell.live });
                return;
            }
            if (event.target.closest('[data-lab="reset"]')) {
                state.answers = SORT_ANSWERS.map(function () { return null; });
                draw();
                const first = shell.view.querySelector("[data-sort]");
                if (first) first.focus({ preventScroll: true });
            }
        };

        draw();
        return null;
    }

    // ---------- 19. Mini-lab 2: watch a model learn (a line learns with gradient descent) ----------
    // Pretend data: hours of study -> test score
    const FIT_HOURS = [1, 2, 3, 4, 5, 6, 7, 8, 9];
    const FIT_SCORES = [33, 45, 46, 58, 56, 69, 71, 78, 85];
    const FIT_START = { a: -0.2, b: 0.6 };   // the line starts sloping the wrong way
    const FIT_RATE = 0.6;                     // the "learning rate": how big each nudge is

    // Average error of the line "score = a * hours + b", in points (root mean square)
    function fitError(a, b) {
        let total = 0;
        FIT_HOURS.forEach(function (hours, i) {
            const diff = a * (hours / 10) + b - FIT_SCORES[i] / 100;
            total += diff * diff;
        });
        return Math.sqrt(total / FIT_HOURS.length) * 100;
    }

    // One step of gradient descent: find which way makes the error smaller, move a little
    function fitStep(state) {
        let slopeA = 0;
        let slopeB = 0;
        FIT_HOURS.forEach(function (hours, i) {
            const x = hours / 10;
            const diff = state.a * x + state.b - FIT_SCORES[i] / 100;
            slopeA += (2 * diff * x) / FIT_HOURS.length;
            slopeB += (2 * diff) / FIT_HOURS.length;
        });
        state.a -= FIT_RATE * slopeA;
        state.b -= FIT_RATE * slopeB;
        state.step += 1;
        const error = fitError(state.a, state.b);
        const previous = state.history[state.history.length - 1];
        state.history.push(error);
        state.done = Math.abs(previous - error) < 0.005 || state.step >= 300;
    }

    function freshFit() {
        return { a: FIT_START.a, b: FIT_START.b, step: 0, history: [fitError(FIT_START.a, FIT_START.b)], done: false, running: false };
    }

    function mountFitLab(box, state) {
        const shell = labShell(box);
        const view = shell.view;

        // Chart sizes (in SVG units)
        const left = 46;
        const right = 326;
        const top = 14;
        const bottom = 190;
        const sx = function (hours) { return left + (hours / 10) * (right - left); };
        const sy = function (score) { return bottom - (score / 100) * (bottom - top); };
        const lossLeft = 30;
        const lossRight = 292;
        const lossTop = 10;
        const lossBottom = 84;
        const lossMax = 25;

        let gridLines = "";
        let labels = "";
        [0, 25, 50, 75, 100].forEach(function (score) {
            gridLines += `<line x1="${left}" x2="${right}" y1="${sy(score)}" y2="${sy(score)}"/>`;
            labels += `<text x="${left - 8}" y="${sy(score) + 3.5}" text-anchor="end">${score}</text>`;
        });
        [0, 2, 4, 6, 8, 10].forEach(function (hours) {
            gridLines += `<line x1="${sx(hours)}" x2="${sx(hours)}" y1="${top}" y2="${bottom}"/>`;
            labels += `<text x="${sx(hours)}" y="${bottom + 15}" text-anchor="middle">${hours}</text>`;
        });
        const points = FIT_HOURS.map(function (hours, i) {
            return `<circle cx="${sx(hours)}" cy="${sy(FIT_SCORES[i])}" r="5"/>`;
        }).join("");

        view.innerHTML = `
            <div class="lsn-fit">
                <figure class="lsn-fit-chart">
                    <svg viewBox="0 0 340 230" role="img" aria-label="${esc(t("lessons.w2.chart"))}">
                        <defs>
                            <clipPath id="lsn-fit-clip"><rect x="${left}" y="${top}" width="${right - left}" height="${bottom - top}"/></clipPath>
                        </defs>
                        <g class="lsn-chart-grid">${gridLines}</g>
                        <g class="lsn-chart-labels">${labels}</g>
                        <text class="lsn-chart-title" x="${(left + right) / 2}" y="224" text-anchor="middle">${t("lessons.w2.hours")}</text>
                        <text class="lsn-chart-title" transform="translate(11 ${(top + bottom) / 2}) rotate(-90)" text-anchor="middle">${t("lessons.w2.score")}</text>
                        <g class="lsn-fit-residuals" data-residuals clip-path="url(#lsn-fit-clip)"></g>
                        <line class="lsn-fit-line" data-line clip-path="url(#lsn-fit-clip)"/>
                        <g class="lsn-fit-points">${points}</g>
                    </svg>
                    <figcaption class="lsn-legend">
                        <span><i class="lsn-key-dot" aria-hidden="true"></i>${t("lessons.w2.data")}</span>
                        <span><i class="lsn-key-line" aria-hidden="true"></i>${t("lessons.w2.model")}</span>
                        <span><i class="lsn-key-dash" aria-hidden="true"></i>${t("lessons.w2.residual")}</span>
                    </figcaption>
                </figure>
                <div class="lsn-fit-side">
                    <p class="lsn-stat-step mono" data-stat="step"></p>
                    <p class="lsn-stat-big" data-stat="error"></p>
                    <p class="lsn-stat-small" data-stat="predict"></p>
                    <figure class="lsn-loss">
                        <figcaption class="mono">${t("lessons.w2.lossTitle")}</figcaption>
                        <svg viewBox="0 0 300 92" role="img" aria-label="${esc(t("lessons.w2.lossChart"))}">
                            <defs>
                                <linearGradient id="lsn-loss-fill" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="0" class="lsn-stop-a"></stop>
                                    <stop offset="1" class="lsn-stop-fade"></stop>
                                </linearGradient>
                            </defs>
                            <line class="lsn-loss-axis" x1="${lossLeft}" x2="${lossRight}" y1="${lossBottom}" y2="${lossBottom}"/>
                            <line class="lsn-loss-axis" x1="${lossLeft}" x2="${lossLeft}" y1="${lossTop}" y2="${lossBottom}"/>
                            <text class="lsn-loss-tick" x="${lossLeft - 5}" y="${lossTop + 4}" text-anchor="end">${lossMax}</text>
                            <text class="lsn-loss-tick" x="${lossLeft - 5}" y="${lossBottom}" text-anchor="end">0</text>
                            <path class="lsn-loss-area" data-loss-area/>
                            <polyline class="lsn-loss-line" data-loss/>
                            <circle class="lsn-loss-dot" r="3.5" data-loss-dot/>
                        </svg>
                    </figure>
                </div>
                <div class="lsn-lab-actions">
                    <button type="button" class="btn btn-primary btn-small" data-lab="step" data-fid="w2-step"><span aria-hidden="true">➕</span> ${t("lessons.w2.step")}</button>
                    <button type="button" class="btn btn-ghost btn-small" data-lab="auto" data-fid="w2-auto"></button>
                    <button type="button" class="btn btn-ghost btn-small" data-lab="reset" data-fid="w2-reset"><span aria-hidden="true">↺</span> ${t("lessons.w2.reset")}</button>
                </div>
                <p class="lsn-lab-status" data-status></p>
                <p class="lsn-lab-small">${t("lessons.w2.fake")}</p>
            </div>`;

        const line = view.querySelector("[data-line]");
        const residuals = view.querySelector("[data-residuals]");
        const lossLine = view.querySelector("[data-loss]");
        const lossArea = view.querySelector("[data-loss-area]");
        const lossDot = view.querySelector("[data-loss-dot]");
        const autoButton = view.querySelector('[data-lab="auto"]');
        const status = view.querySelector("[data-status]");
        let frame = 0;
        let lastTime = 0;

        function update() {
            const model = function (hours) { return (state.a * (hours / 10) + state.b) * 100; };
            line.setAttribute("x1", sx(0));
            line.setAttribute("y1", sy(model(0)).toFixed(1));
            line.setAttribute("x2", sx(10));
            line.setAttribute("y2", sy(model(10)).toFixed(1));
            residuals.innerHTML = FIT_HOURS.map(function (hours, i) {
                return `<line x1="${sx(hours)}" x2="${sx(hours)}" y1="${sy(FIT_SCORES[i])}" y2="${sy(model(hours)).toFixed(1)}"/>`;
            }).join("");

            const error = state.history[state.history.length - 1];
            view.querySelector('[data-stat="step"]').textContent = t("lessons.w2.steps", { n: state.step });
            view.querySelector('[data-stat="error"]').textContent = t("lessons.w2.error", { e: A.format.number(error, 1) });
            view.querySelector('[data-stat="predict"]').textContent = A.plural("lessons.w2.predict", Math.round(model(10)));

            // The error curve
            const maxSteps = Math.max(60, state.history.length - 1);
            const lx = function (i) { return lossLeft + (i / maxSteps) * (lossRight - lossLeft); };
            const ly = function (value) { return lossBottom - (Math.min(value, lossMax) / lossMax) * (lossBottom - lossTop); };
            const coords = state.history.map(function (value, i) { return lx(i).toFixed(1) + "," + ly(value).toFixed(1); });
            lossLine.setAttribute("points", coords.join(" "));
            lossArea.setAttribute("d", "M" + lx(0) + "," + lossBottom + " L" + coords.join(" L") + " L" + lx(state.history.length - 1).toFixed(1) + "," + lossBottom + " Z");
            lossDot.setAttribute("cx", lx(state.history.length - 1).toFixed(1));
            lossDot.setAttribute("cy", ly(error).toFixed(1));

            autoButton.innerHTML = state.running
                ? '<span aria-hidden="true">⏸</span> ' + esc(t("lessons.w2.pause"))
                : '<span aria-hidden="true">▶</span> ' + esc(t("lessons.w2.auto"));
            status.textContent = t(state.done ? "lessons.w2.done" : state.step === 0 ? "lessons.w2.start" : "lessons.w2.learning");
            status.classList.toggle("is-done", state.done);
        }

        function stepOnce() {
            fitStep(state);
            if (state.done && state.running) {
                state.running = false;
                A.announce(t("lessons.w2.done"), { region: shell.live });
            }
            update();
        }

        function loop(now) {
            if (!state.running) return;
            if (now - lastTime >= 70) {
                lastTime = now;
                stepOnce();
            }
            if (state.running) frame = requestAnimationFrame(loop);
        }

        function setRunning(on) {
            cancelAnimationFrame(frame);
            if (on && state.done) Object.assign(state, freshFit());   // learned already: start again
            state.running = on;
            if (on) frame = requestAnimationFrame(loop);
            update();
        }

        box.onclick = function (event) {
            const button = event.target.closest("[data-lab]");
            if (!button) return;
            const action = button.getAttribute("data-lab");
            if (action === "step") {
                if (state.running) setRunning(false);
                stepOnce();
                A.announce(t("lessons.w2.steps", { n: state.step }) + ". " +
                    t("lessons.w2.error", { e: A.format.number(state.history[state.history.length - 1], 1) }) +
                    (state.done ? " " + t("lessons.w2.done") : ""), { region: shell.live });
            } else if (action === "auto") {
                setRunning(!state.running);
            } else if (action === "reset") {
                cancelAnimationFrame(frame);
                Object.assign(state, freshFit());
                update();
            }
        };

        update();
        if (state.running) frame = requestAnimationFrame(loop);
        return function () { cancelAnimationFrame(frame); };
    }

    // ---------- 20. Mini-lab 3: play with a neuron ----------
    // Starts on "Go to the park!" (z = 0.35), so the "Try this" hint can flip it
    const NEURON_START = { x1: 0.9, x2: 0.2, w1: 1.5, w2: 2.5, b: -1.5 };
    const NEURON_SLIDERS = [
        { key: "x1", min: 0, max: 1, step: 0.05, digits: 2, label: "lessons.w3.x1" },
        { key: "x2", min: 0, max: 1, step: 0.05, digits: 2, label: "lessons.w3.x2" },
        { key: "w1", min: -3, max: 3, step: 0.1, digits: 1, label: "lessons.w3.w1" },
        { key: "w2", min: -3, max: 3, step: 0.1, digits: 1, label: "lessons.w3.w2" },
        { key: "b", min: -3, max: 3, step: 0.1, digits: 1, label: "lessons.w3.b" }
    ];

    function mountNeuronLab(box, state) {
        const shell = labShell(box);
        const view = shell.view;

        function sliderHTML(slider) {
            const id = "lsn-neuron-" + slider.key;
            return `
                <div class="lsn-slider">
                    <label for="${id}">${t(slider.label)}</label>
                    <output for="${id}" class="mono" data-value="${slider.key}"></output>
                    <input class="lsn-range" type="range" id="${id}" data-key="${slider.key}" data-fid="w3-${slider.key}"
                           min="${slider.min}" max="${slider.max}" step="${slider.step}" value="${state[slider.key]}">
                </div>`;
        }

        view.innerHTML = `
            <div class="lsn-neuron">
                <svg class="lsn-neuron-svg" viewBox="0 0 360 196" role="img" aria-label="${esc(t("lessons.w3.diagram"))}">
                    <line class="lsn-edge" data-edge="1" x1="62" y1="50" x2="214" y2="98"/>
                    <line class="lsn-edge" data-edge="2" x1="62" y1="146" x2="214" y2="98"/>
                    <line class="lsn-edge-out" x1="246" y1="98" x2="290" y2="98"/>
                    <g class="lsn-edge-tag" transform="translate(132 64)">
                        <rect x="-23" y="-12" width="46" height="24" rx="8"/>
                        <text text-anchor="middle" y="4.5" data-tag="1"></text>
                    </g>
                    <g class="lsn-edge-tag" transform="translate(132 132)">
                        <rect x="-23" y="-12" width="46" height="24" rx="8"/>
                        <text text-anchor="middle" y="4.5" data-tag="2"></text>
                    </g>
                    <text class="lsn-svg-emoji" x="22" y="56" text-anchor="middle">☀️</text>
                    <text class="lsn-svg-emoji" x="22" y="152" text-anchor="middle">📚</text>
                    <circle class="lsn-in-node" cx="62" cy="50" r="22"/>
                    <circle class="lsn-in-node" cx="62" cy="146" r="22"/>
                    <text class="lsn-in-value" x="62" y="54.5" text-anchor="middle" data-in="1"></text>
                    <text class="lsn-in-value" x="62" y="150.5" text-anchor="middle" data-in="2"></text>
                    <circle class="lsn-neuron-glow" cx="226" cy="98" r="46"/>
                    <circle class="lsn-neuron-core" cx="226" cy="98" r="30"/>
                    <text class="lsn-neuron-sigma" x="226" y="94" text-anchor="middle">Σ</text>
                    <text class="lsn-neuron-z" x="226" y="113" text-anchor="middle" data-z></text>
                    <rect class="lsn-out-box" x="290" y="76" width="62" height="44" rx="12"/>
                    <text class="lsn-out-value" x="321" y="104" text-anchor="middle" data-out></text>
                </svg>
                <div class="lsn-neuron-controls">
                    <fieldset class="lsn-fieldset">
                        <legend class="mono">${t("lessons.w3.inputs")}</legend>
                        ${NEURON_SLIDERS.slice(0, 2).map(sliderHTML).join("")}
                    </fieldset>
                    <fieldset class="lsn-fieldset">
                        <legend class="mono">${t("lessons.w3.params")}</legend>
                        ${NEURON_SLIDERS.slice(2).map(sliderHTML).join("")}
                    </fieldset>
                </div>
                <div class="lsn-neuron-result">
                    <p class="lsn-formula mono" data-formula></p>
                    <div class="lsn-meter" aria-hidden="true"><span data-meter></span><i></i></div>
                    <div class="lsn-neuron-verdict">
                        <p class="lsn-verdict" data-verdict></p>
                        <button type="button" class="btn btn-ghost btn-small" data-lab="reset" data-fid="w3-reset"><span aria-hidden="true">↺</span> ${t("lessons.w3.reset")}</button>
                    </div>
                </div>
                <p class="lsn-lab-hint"><span aria-hidden="true">💡</span> ${t("lessons.w3.try")}</p>
                <p class="lsn-lab-small">${t("lessons.w3.explain")}</p>
            </div>`;

        let lastAnswer = null;

        function update(shouldAnnounce) {
            const z = state.w1 * state.x1 + state.w2 * state.x2 + state.b;
            const output = 1 / (1 + Math.exp(-z));   // the sigmoid activation function

            [1, 2].forEach(function (i) {
                const weight = state["w" + i];
                const edge = view.querySelector('[data-edge="' + i + '"]');
                edge.style.strokeWidth = (1.5 + Math.abs(weight) * 2.2).toFixed(1);
                edge.style.opacity = (0.3 + Math.min(1, Math.abs(weight) / 3) * 0.7).toFixed(2);
                edge.classList.toggle("is-negative", weight < 0);
                view.querySelector('[data-tag="' + i + '"]').textContent = A.format.number(weight, 1);
                view.querySelector('[data-in="' + i + '"]').textContent = A.format.number(state["x" + i], 2);
            });
            view.querySelector("[data-z]").textContent = "z=" + A.format.number(z, 2);
            view.querySelector("[data-out]").textContent = A.format.percent(output);
            view.querySelector(".lsn-neuron-svg").style.setProperty("--lsn-out", output.toFixed(3));

            NEURON_SLIDERS.forEach(function (slider) {
                const text = A.format.number(state[slider.key], slider.digits);
                view.querySelector('[data-value="' + slider.key + '"]').textContent = text;
                view.querySelector('[data-key="' + slider.key + '"]').setAttribute("aria-valuetext", text);
            });

            const bias = state.b < 0 ? "− " + A.format.number(-state.b, 1) : "+ " + A.format.number(state.b, 1);
            view.querySelector("[data-formula]").textContent =
                "z = " + A.format.number(state.x1, 2) + " × " + A.format.number(state.w1, 1) +
                " + " + A.format.number(state.x2, 2) + " × " + A.format.number(state.w2, 1) +
                " " + bias + " = " + A.format.number(z, 2) + "   →   σ(z) = " + A.format.percent(output);
            view.querySelector("[data-meter]").style.width = (output * 100).toFixed(1) + "%";

            const isYes = output >= 0.5;
            const verdict = view.querySelector("[data-verdict]");
            verdict.textContent = t("lessons.w3.output") + ": " + t(isYes ? "lessons.w3.yes" : "lessons.w3.no");
            verdict.classList.toggle("is-yes", isYes);
            if (shouldAnnounce && lastAnswer !== null && lastAnswer !== isYes) {
                A.announce(t("lessons.w3.decision", { answer: t(isYes ? "lessons.w3.yes" : "lessons.w3.no") }), { region: shell.live });
            }
            lastAnswer = isYes;
        }

        box.oninput = function (event) {
            const key = event.target.getAttribute("data-key");
            if (!key) return;
            state[key] = parseFloat(event.target.value);
            update(true);
        };

        box.onclick = function (event) {
            if (!event.target.closest('[data-lab="reset"]')) return;
            Object.assign(state, NEURON_START);
            NEURON_SLIDERS.forEach(function (slider) {
                view.querySelector('[data-key="' + slider.key + '"]').value = state[slider.key];
            });
            update(true);
        };

        update(false);
        return null;
    }

    // ---------- 21. Mini-lab 4: be the language model ----------
    // How much the model "likes" each word (made-up scores called logits)
    const WORD_LOGITS = [2.2, 1.5, 1.2, 0.8, 0.4, -0.2];

    // Softmax with temperature: turns the scores into probabilities that add up to 1
    function wordProbabilities(temperature) {
        const scaled = WORD_LOGITS.map(function (logit) { return logit / temperature; });
        const highest = Math.max.apply(null, scaled);
        const exps = scaled.map(function (value) { return Math.exp(value - highest); });
        const sum = exps.reduce(function (total, value) { return total + value; }, 0);
        return exps.map(function (value) { return value / sum; });
    }

    function mountWordsLab(box, state) {
        const shell = labShell(box);
        const view = shell.view;
        const word = function (i) { return t("lessons.w4.word" + (i + 1)); };

        view.innerHTML = `
            <div class="lsn-words">
                <p class="lsn-sentence">
                    <span class="lsn-sentence-prompt">${t("lessons.w4.prompt")}</span>
                    <span class="lsn-blank" data-blank></span><span class="lsn-cursor" aria-hidden="true"></span>
                </p>
                <p class="lsn-lab-sub mono">${t("lessons.w4.probs")}</p>
                <ol class="lsn-bars">
                    ${WORD_LOGITS.map(function (logit, i) {
                        return `
                            <li class="lsn-bar" data-row="${i}">
                                <span class="lsn-bar-word">${word(i)}</span>
                                <span class="lsn-bar-track" aria-hidden="true"><span class="lsn-bar-fill"></span></span>
                                <span class="lsn-bar-value mono"></span>
                            </li>`;
                    }).join("")}
                </ol>
                <div class="lsn-slider lsn-temp">
                    <label for="lsn-temp">${t("lessons.w4.temp")}</label>
                    <output for="lsn-temp" class="mono" data-temp-value></output>
                    <input class="lsn-range" type="range" id="lsn-temp" data-fid="w4-temp" min="0.2" max="2" step="0.1" value="${state.temp}">
                    <div class="lsn-temp-scale" aria-hidden="true"><span>❄ ${t("lessons.w4.low")}</span><span>${t("lessons.w4.high")} 🔥</span></div>
                </div>
                <p class="lsn-temp-note" data-temp-note></p>
                <div class="lsn-lab-actions">
                    <button type="button" class="btn btn-primary btn-small" data-lab="generate" data-fid="w4-generate"><span aria-hidden="true">✨</span> ${t("lessons.w4.generate")}</button>
                    <button type="button" class="btn btn-ghost btn-small" data-lab="clear" data-fid="w4-clear"><span aria-hidden="true">↺</span> ${t("lessons.w4.clear")}</button>
                </div>
                <div class="lsn-history">
                    <p class="lsn-lab-sub mono">${t("lessons.w4.history")}</p>
                    <ol class="lsn-history-list" data-history></ol>
                </div>
                <p class="lsn-lab-small">${t("lessons.w4.note")}</p>
            </div>`;

        const blank = view.querySelector("[data-blank]");
        const rows = Array.prototype.slice.call(view.querySelectorAll(".lsn-bar"));

        function updateBars() {
            const probabilities = wordProbabilities(state.temp);
            rows.forEach(function (row, i) {
                row.querySelector(".lsn-bar-fill").style.width = (probabilities[i] * 100).toFixed(1) + "%";
                row.querySelector(".lsn-bar-value").textContent = A.format.percent(probabilities[i]);
                row.classList.toggle("is-picked", state.last === i);
            });
            const temperature = A.format.number(state.temp, 1);
            view.querySelector("[data-temp-value]").textContent = temperature;
            view.querySelector("#lsn-temp").setAttribute("aria-valuetext", temperature);
            let note = "lessons.w4.tempMid";
            if (state.temp < 0.6) note = "lessons.w4.tempLow";
            else if (state.temp > 1.3) note = "lessons.w4.tempHigh";
            view.querySelector("[data-temp-note]").textContent = t(note);
        }

        function updateSentence() {
            blank.textContent = state.last === null ? "…" : word(state.last);
            blank.classList.toggle("is-filled", state.last !== null);
            const list = view.querySelector("[data-history]");
            list.innerHTML = state.history.length
                ? state.history.map(function (i, index) {
                    return `<li class="lsn-history-chip${index === 0 ? " is-new" : ""}">${word(i)}</li>`;
                }).join("")
                : `<li class="lsn-history-empty">${t("lessons.w4.empty")}</li>`;
        }

        function generate() {
            const probabilities = wordProbabilities(state.temp);
            const picked = A.util.sampleWeighted(probabilities);
            state.last = picked;
            state.history.unshift(picked);
            state.history = state.history.slice(0, 10);
            updateBars();
            updateSentence();
            A.dom.replay(blank, "is-pop");   // the little "pop" on the new word
            A.announce(t("lessons.w4.picked", { word: word(picked), p: A.format.percent(probabilities[picked]) }), { region: shell.live });
        }

        box.oninput = function (event) {
            if (event.target.id !== "lsn-temp") return;
            state.temp = parseFloat(event.target.value);
            updateBars();
        };

        box.onclick = function (event) {
            const button = event.target.closest("[data-lab]");
            if (!button) return;
            if (button.getAttribute("data-lab") === "generate") {
                generate();
            } else {
                state.history = [];
                state.last = null;
                updateBars();
                updateSentence();
            }
        };

        updateBars();
        updateSentence();
        return null;
    }

    // ---------- 22. Mini-lab 5: spot the hidden AI ----------
    const DAY_MOMENTS = [
        { time: "07:00", icon: "📱" },
        { time: "08:10", icon: "🚌" },
        { time: "12:30", icon: "⌨️" },
        { time: "16:00", icon: "📧" },
        { time: "19:00", icon: "📸" },
        { time: "21:00", icon: "🎬" }
    ];

    function mountDayLab(box, state) {
        const shell = labShell(box);

        function draw() {
            const found = state.found.filter(Boolean).length;
            const items = DAY_MOMENTS.map(function (moment, i) {
                const isOpen = state.open[i];
                return `
                    <li class="lsn-moment${isOpen ? " is-open" : ""}${state.found[i] ? " is-found" : ""}">
                        <span class="lsn-moment-time mono" aria-hidden="true">${moment.time}</span>
                        <div class="lsn-moment-card">
                            <button type="button" class="lsn-moment-button" data-moment="${i}" data-fid="w5-${i}"
                                    aria-expanded="${isOpen}" aria-controls="lsn-moment-${i}">
                                <span class="lsn-moment-icon" aria-hidden="true">${moment.icon}</span>
                                <span class="lsn-moment-text"><span class="sr-only">${moment.time} — </span>${t("lessons.w5.m" + (i + 1))}</span>
                                <span class="lsn-moment-hint mono" aria-hidden="true">${isOpen ? "🤖" : t("lessons.w5.hint")}</span>
                            </button>
                            <p class="lsn-moment-ai" id="lsn-moment-${i}"${isOpen ? "" : " hidden"}>
                                <strong>${t("lessons.w5.aiLabel")}</strong> ${t("lessons.w5.a" + (i + 1))}
                            </p>
                        </div>
                    </li>`;
            }).join("");

            redraw(shell.view, `
                <ol class="lsn-day">${items}</ol>
                <div class="lsn-lab-foot">
                    <p class="lsn-lab-score">
                        <span class="lsn-progress-mini" aria-hidden="true"><span style="width: ${(found / DAY_MOMENTS.length) * 100}%"></span></span>
                        ${t("lessons.w5.found", { n: found, total: DAY_MOMENTS.length })}
                    </p>
                    ${found ? `<button type="button" class="btn btn-ghost btn-small" data-lab="reset" data-fid="w5-reset">↺ ${t("lessons.w5.reset")}</button>` : ""}
                </div>
                ${found === DAY_MOMENTS.length ? `<p class="lsn-lab-win">${t("lessons.w5.all")}</p>` : ""}`);
        }

        box.onclick = function (event) {
            const button = event.target.closest("[data-moment]");
            if (button) {
                const i = Number(button.getAttribute("data-moment"));
                const wasFound = state.found.filter(Boolean).length;
                state.open[i] = !state.open[i];
                state.found[i] = true;
                draw();
                const found = state.found.filter(Boolean).length;
                if (found === DAY_MOMENTS.length && wasFound < found) A.announce(t("lessons.w5.all"), { region: shell.live });
                else if (wasFound < found) A.announce(t("lessons.w5.found", { n: found, total: DAY_MOMENTS.length }), { region: shell.live });
                return;
            }
            if (event.target.closest('[data-lab="reset"]')) {
                state.open = DAY_MOMENTS.map(function () { return false; });
                state.found = DAY_MOMENTS.map(function () { return false; });
                draw();
                const first = shell.view.querySelector("[data-moment]");
                if (first) first.focus({ preventScroll: true });
            }
        };

        draw();
        return null;
    }

    // ---------- 23. Mini-lab 6: what would you do? ----------
    const DILEMMA_BEST = [1, 1, 2];   // the most responsible option in each situation

    function mountDilemmaLab(box, state) {
        const shell = labShell(box);

        function draw() {
            let good = 0;
            let answered = 0;
            const items = DILEMMA_BEST.map(function (best, s) {
                const key = "lessons.w6.s" + (s + 1);
                const chosen = state.choices[s];
                const hasChosen = chosen !== null;
                if (hasChosen) {
                    answered += 1;
                    if (chosen === best) good += 1;
                }
                const options = [0, 1, 2].map(function (o) {
                    let stateClass = "";
                    if (hasChosen) {
                        if (o === best) stateClass = " is-best";
                        else if (o === chosen) stateClass = " is-chosen";
                        else stateClass = " is-dim";
                    }
                    return `<button type="button" class="lsn-choice${stateClass}" data-s="${s}" data-o="${o}" data-fid="w6-${s}-${o}"
                                aria-pressed="${chosen === o}"${hasChosen ? ' aria-disabled="true"' : ""}>${t(key + "o" + (o + 1))}</button>`;
                }).join("");

                let feedback = "";
                if (hasChosen) {
                    const isBest = chosen === best;
                    feedback = `
                        <div class="lsn-dilemma-feedback ${isBest ? "is-good" : "is-bad"}">
                            <p><strong>${isBest ? "✓ " + t("lessons.w6.best") : "✗ " + t("lessons.w6.notBest")}</strong> ${t(key + "f" + (chosen + 1))}</p>
                            ${isBest ? "" : `<p><strong>${t("lessons.w6.better")}</strong> ${t(key + "o" + (best + 1))}. ${t(key + "f" + (best + 1))}</p>`}
                        </div>`;
                }
                return `
                    <li class="lsn-dilemma">
                        <p class="lsn-dilemma-tag mono">${t("lessons.w6.situation", { n: s + 1 })}</p>
                        <p class="lsn-dilemma-text" id="lsn-dilemma-${s}">${t(key)}</p>
                        <div class="lsn-dilemma-options" role="group" aria-labelledby="lsn-dilemma-${s}">${options}</div>
                        ${feedback}
                    </li>`;
            }).join("");

            redraw(shell.view, `
                <ol class="lsn-dilemmas">${items}</ol>
                <div class="lsn-lab-foot">
                    <p class="lsn-lab-score">${t("lessons.w6.score", { n: good, total: DILEMMA_BEST.length })}</p>
                    ${answered ? `<button type="button" class="btn btn-ghost btn-small" data-lab="reset" data-fid="w6-reset">↺ ${t("lessons.w6.reset")}</button>` : ""}
                </div>`);
        }

        box.onclick = function (event) {
            const button = event.target.closest("[data-s]");
            if (button) {
                const s = Number(button.getAttribute("data-s"));
                if (state.choices[s] !== null) return;
                state.choices[s] = Number(button.getAttribute("data-o"));
                draw();
                const key = "lessons.w6.s" + (s + 1);
                const isBest = state.choices[s] === DILEMMA_BEST[s];
                A.announce(t(isBest ? "lessons.w6.best" : "lessons.w6.notBest") + " " + t(key + "f" + (state.choices[s] + 1)), { region: shell.live });
                return;
            }
            if (event.target.closest('[data-lab="reset"]')) {
                state.choices = DILEMMA_BEST.map(function () { return null; });
                draw();
                const first = shell.view.querySelector("[data-s]");
                if (first) first.focus({ preventScroll: true });
            }
        };

        draw();
        return null;
    }

    // Which mini-lab each lesson uses, and how a fresh one starts
    const LAB_TYPES = {
        sort: { mount: mountSortLab, fresh: function () { return { answers: SORT_ANSWERS.map(function () { return null; }) }; } },
        fit: { mount: mountFitLab, fresh: freshFit },
        neuron: { mount: mountNeuronLab, fresh: function () { return Object.assign({}, NEURON_START); } },
        words: { mount: mountWordsLab, fresh: function () { return { temp: 1, history: [], last: null }; } },
        day: {
            mount: mountDayLab,
            fresh: function () {
                return { open: DAY_MOMENTS.map(function () { return false; }), found: DAY_MOMENTS.map(function () { return false; }) };
            }
        },
        dilemmas: { mount: mountDilemmaLab, fresh: function () { return { choices: DILEMMA_BEST.map(function () { return null; }) }; } }
    };

    function mountLab(n, box) {
        const type = LAB_TYPES[LESSONS[n - 1].lab];
        if (!labState[n]) labState[n] = type.fresh();
        return type.mount(box, labState[n]);
    }

    // ---------- 24. The lesson reader (a full-screen dialog) ----------
    const reader = {
        open: false,
        lesson: 0,
        opener: null,
        closeTimer: 0,
        scrollRatio: 0,
        cleanupLab: null,
        previousHash: "",
        renderedLang: ""
    };

    const SIZES = ["s", "m", "l"];
    let textSize = A.storage.get("lessons.textSize", "m");
    if (SIZES.indexOf(textSize) === -1) textSize = "m";

    const readerEl = document.createElement("div");
    readerEl.className = "lsn-reader";
    readerEl.hidden = true;
    readerEl.setAttribute("data-size", textSize);
    readerEl.innerHTML = `
        <div class="lsn-reader-backdrop" data-action="close"></div>
        <div class="lsn-reader-panel" role="dialog" aria-modal="true" aria-labelledby="lsn-reader-title">
            <div class="lsn-reader-progress" aria-hidden="true"><span data-ref="progress"></span></div>
            <header class="lsn-reader-top">
                <div class="lsn-reader-where">
                    <span class="lsn-reader-pulse" aria-hidden="true"></span>
                    <p class="lsn-reader-crumb mono" data-ref="crumb"></p>
                    <p class="lsn-reader-keys mono" data-ref="keys"></p>
                </div>
                <div class="lsn-reader-tools">
                    <button type="button" class="lsn-tool lsn-tool-listen" data-action="listen" data-fid="listen">
                        <span class="lsn-wave" aria-hidden="true"><i></i><i></i><i></i></span>
                        <span data-ref="listenText"></span>
                    </button>
                    <button type="button" class="lsn-tool" data-action="size" data-fid="size">
                        <span aria-hidden="true">A<small>A</small></span>
                    </button>
                    <button type="button" class="lsn-tool lsn-tool-close" data-action="close" data-fid="close">
                        <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/></svg>
                    </button>
                </div>
            </header>
            <div class="lsn-reader-scroll" data-ref="scroll">
                <div class="lsn-reader-layout">
                    <nav class="lsn-toc" aria-labelledby="lsn-toc-title">
                        <p class="lsn-toc-title mono" id="lsn-toc-title" data-ref="tocTitle"></p>
                        <ol class="lsn-toc-list" data-ref="toc"></ol>
                    </nav>
                    <article class="lsn-article" data-ref="article"></article>
                </div>
            </div>
            <footer class="lsn-reader-foot">
                <button type="button" class="btn btn-ghost lsn-nav lsn-nav-prev" data-action="prev" data-fid="prev">
                    <span class="lsn-nav-arrow" aria-hidden="true">←</span>
                    <span class="lsn-nav-copy"><span class="lsn-nav-small mono"></span><span class="lsn-nav-title"></span></span>
                </button>
                <button type="button" class="btn btn-primary lsn-complete" data-action="complete" data-fid="complete">
                    <span data-ref="completeText"></span>
                </button>
                <button type="button" class="btn btn-ghost lsn-nav lsn-nav-next" data-action="next" data-fid="next">
                    <span class="lsn-nav-copy"><span class="lsn-nav-small mono"></span><span class="lsn-nav-title"></span></span>
                    <span class="lsn-nav-arrow" aria-hidden="true">→</span>
                </button>
            </footer>
        </div>`;
    document.body.appendChild(readerEl);

    const panel = readerEl.querySelector(".lsn-reader-panel");
    const parts = {
        backdrop: readerEl.querySelector(".lsn-reader-backdrop"),
        progress: ref(readerEl, "progress"),
        crumb: ref(readerEl, "crumb"),
        keys: ref(readerEl, "keys"),
        listen: readerEl.querySelector('[data-action="listen"]'),
        listenText: ref(readerEl, "listenText"),
        size: readerEl.querySelector('[data-action="size"]'),
        close: readerEl.querySelector(".lsn-tool-close"),
        scroll: ref(readerEl, "scroll"),
        tocTitle: ref(readerEl, "tocTitle"),
        toc: ref(readerEl, "toc"),
        article: ref(readerEl, "article"),
        prev: readerEl.querySelector('[data-action="prev"]'),
        next: readerEl.querySelector('[data-action="next"]'),
        complete: readerEl.querySelector('[data-action="complete"]'),
        completeText: ref(readerEl, "completeText")
    };

    // On very narrow screens the "Listen" button shows only its sound bars. The word
    // is hidden with the shared .sr-only class, so screen readers still read it.
    A.onMedia("(max-width: 400px)", function (narrow) {
        parts.listenText.classList.toggle("sr-only", narrow);
    });

    // The reader is a pop-up window of the page (see "overlays" in core.js). While it is
    // open, core stops the page from scrolling, makes the rest of the page unreachable
    // (inert), keeps Tab inside the panel and closes the reader with Esc, when the page
    // goes to another section and when a Ctrl+K command runs. We only report when the
    // reader opens and closes.
    const overlay = A.overlays.register(READER_ID, {
        root: readerEl,          // the panel and the backdrop around it
        element: panel,
        modal: true,
        closeOnNavigate: true,
        // Esc and a plain close give the focus back to the button that opened the reader.
        // After "navigate" or "command" the place you go to takes the focus.
        close: function (reason) {
            closeReader({ restoreFocus: reason === "escape" || reason === "close" });
        }
    });

    // The full text of one lesson
    function articleHTML(n) {
        const lesson = LESSONS[n - 1];
        let html = `
            <header class="lsn-article-head">
                <div class="lsn-article-icon" aria-hidden="true">${lesson.icon}</div>
                <div class="lsn-article-chips">
                    <span class="chip lsn-level lsn-level-${lesson.level}"><span class="lsn-dot" aria-hidden="true"></span>${t("lessons.level." + lesson.level)}</span>
                    <span class="chip"><span aria-hidden="true">⏱</span>${t("lessons.card.minutes", { n: lesson.minutes })}</span>
                    <span class="chip lsn-chip-done" data-ref="doneChip" hidden>✓ ${t("lessons.card.done")}</span>
                </div>
                <h2 class="lsn-article-title" id="lsn-reader-title" tabindex="-1" data-fid="title" data-speak>${lessonTitle(n)}</h2>
                <p class="lsn-article-lead" data-speak>${t(lessonKey(n, "desc"))}</p>
            </header>`;

        for (let i = 1; i <= lesson.sections; i++) {
            const note = lesson.notes[i];
            const noteIcon = { fact: "✨", example: "🔎", tip: "💡" }[note];
            html += `
                <section class="lsn-part" id="lsn-part-s${i}" data-part="s${i}">
                    <h3 class="lsn-part-title" tabindex="-1" data-fid="part-s${i}"><span class="lsn-part-num mono" aria-hidden="true">${pad(i)}</span><span data-speak>${t(lessonKey(n, "s" + i + ".h"))}</span></h3>
                    <p class="lsn-part-text" data-speak>${t(lessonKey(n, "s" + i + ".p"))}</p>
                    ${note ? `
                    <aside class="lsn-note lsn-note-${note}">
                        <p class="lsn-note-label mono"><span aria-hidden="true">${noteIcon}</span> ${t("lessons.note." + note)}</p>
                        <p data-speak>${t(lessonKey(n, "s" + i + ".note"))}</p>
                    </aside>` : ""}
                </section>`;
        }

        html += `
            <section class="lsn-part lsn-lab" id="lsn-part-lab" data-part="lab" aria-labelledby="lsn-lab-title">
                <div class="lsn-lab-head">
                    <p class="lsn-lab-label mono"><span class="lsn-lab-led" aria-hidden="true"></span>${t("lessons.reader.miniLab")}</p>
                    <h3 class="lsn-lab-title" id="lsn-lab-title" tabindex="-1" data-fid="part-lab">${t("lessons.w" + n + ".title")}</h3>
                    <p class="lsn-lab-intro">${t("lessons.w" + n + ".intro")}</p>
                </div>
                <div class="lsn-lab-body" data-ref="lab"></div>
            </section>

            <section class="lsn-part lsn-keys" id="lsn-part-keys" data-part="keys">
                <h3 class="lsn-part-title" tabindex="-1" data-fid="part-keys"><span class="lsn-part-num mono" aria-hidden="true">✦</span><span data-speak>${t("lessons.reader.keyIdeas")}</span></h3>
                <ul class="lsn-keys-list">
                    ${[1, 2, 3].map(function (k) {
                        return `<li><span class="lsn-key-num mono" aria-hidden="true">${pad(k)}</span><span data-speak>${t(lessonKey(n, "key" + k))}</span></li>`;
                    }).join("")}
                </ul>
            </section>

            <aside class="lsn-try" aria-labelledby="lsn-try-label">
                <span class="lsn-try-icon" aria-hidden="true">${lesson.tryIcon}</span>
                <div class="lsn-try-body">
                    <p class="lsn-try-label mono" id="lsn-try-label">${t("lessons.reader.tryIt")}</p>
                    <p class="lsn-try-text">${t(lessonKey(n, "tip"))}</p>
                </div>
                <button type="button" class="btn btn-primary btn-small" data-action="try" data-fid="try">${t(lessonKey(n, "tipBtn"))} <span class="lsn-arrow" aria-hidden="true">→</span></button>
            </aside>

            <section class="lsn-part lsn-check" id="lsn-part-check" data-part="check" aria-labelledby="lsn-check-title">
                <h3 class="lsn-part-title" id="lsn-check-title" tabindex="-1" data-fid="part-check"><span class="lsn-part-num mono" aria-hidden="true">?</span><span>${t("lessons.reader.check")}</span></h3>
                <p class="lsn-check-question" id="lsn-check-question">${t(lessonKey(n, "q"))}</p>
                <div class="lsn-options" role="group" aria-labelledby="lsn-check-question" data-ref="options"></div>
                <div class="lsn-feedback" aria-live="polite" data-ref="feedback"></div>
            </section>`;
        return html;
    }

    // The "In this lesson" list on the left
    function tocHTML(n) {
        const lesson = LESSONS[n - 1];
        const items = [];
        for (let i = 1; i <= lesson.sections; i++) {
            items.push({ part: "s" + i, num: pad(i), text: t(lessonKey(n, "s" + i + ".h")) });
        }
        items.push({ part: "lab", num: "🧪", text: t("lessons.reader.miniLab") });
        items.push({ part: "keys", num: "✦", text: t("lessons.reader.keyIdeas") });
        items.push({ part: "check", num: "?", text: t("lessons.reader.check") });
        return items.map(function (item) {
            return `<li><button type="button" class="lsn-toc-link" data-goto="${item.part}" data-fid="toc-${item.part}">
                        <span class="lsn-toc-num mono" aria-hidden="true">${item.num}</span><span>${item.text}</span>
                    </button></li>`;
        }).join("");
    }

    // ----- "Check yourself" -----
    function renderCheck() {
        const n = reader.lesson;
        const lesson = LESSONS[n - 1];
        const options = ref(parts.article, "options");
        const feedback = ref(parts.article, "feedback");
        if (!options || !feedback) return;
        const chosen = checkAnswers[n];
        const answered = chosen !== undefined;
        const letters = t("lessons.check.letters").split("|");

        redraw(options, [0, 1, 2].map(function (i) {
            let stateClass = "";
            let mark = letters[i] || String(i + 1);
            if (answered) {
                if (i === lesson.correct) {
                    stateClass = " is-correct";
                    mark = "✓";
                } else if (i === chosen) {
                    stateClass = " is-wrong";
                    mark = "✗";
                } else {
                    stateClass = " is-dim";
                }
            }
            return `<button type="button" class="lsn-option${stateClass}" data-option="${i}" data-fid="option-${i}"
                        aria-pressed="${chosen === i}"${answered ? ' aria-disabled="true"' : ""}>
                        <span class="lsn-option-mark mono" aria-hidden="true">${mark}</span>
                        <span class="lsn-option-text">${t(lessonKey(n, "a" + (i + 1)))}</span>
                    </button>`;
        }).join(""));

        if (!answered) {
            feedback.innerHTML = "";
            return;
        }
        const isRight = chosen === lesson.correct;
        const rightAnswer = t(lessonKey(n, "a" + (lesson.correct + 1)));
        feedback.innerHTML = `
            <div class="lsn-feedback-box ${isRight ? "is-correct" : "is-wrong"}">
                <p class="lsn-feedback-title"><span aria-hidden="true">${isRight ? "🎉" : "🤔"}</span> ${t(isRight ? "lessons.check.correct" : "lessons.check.wrong")}</p>
                ${isRight ? "" : `<p>${t("lessons.check.rightAnswer", { answer: rightAnswer })}</p>`}
                <p>${t(lessonKey(n, "explain"))}</p>
                ${isRight && completed.has(n) ? `<p class="lsn-feedback-done">${t("lessons.check.autoDone")}</p>` : ""}
                ${isRight ? "" : `<button type="button" class="btn btn-ghost btn-small" data-action="retry" data-fid="retry">↺ ${t("lessons.check.retry")}</button>`}
            </div>`;
    }

    function answerCheck(choice) {
        const n = reader.lesson;
        if (checkAnswers[n] !== undefined) return;
        checkAnswers[n] = choice;
        // A right answer completes the lesson automatically
        if (choice === LESSONS[n - 1].correct && !completed.has(n)) setCompleted(n, true);
        renderCheck();
    }

    function retryCheck() {
        delete checkAnswers[reader.lesson];
        renderCheck();
        const first = parts.article.querySelector("[data-option]");
        if (first) first.focus({ preventScroll: true });
    }

    // ----- Building and updating the reader -----
    function stopLab(pause) {
        if (pause && labState[reader.lesson]) labState[reader.lesson].running = false;
        if (reader.cleanupLab) reader.cleanupLab();
        reader.cleanupLab = null;
    }

    function renderLessonContent() {
        const n = reader.lesson;
        reader.renderedLang = A.lang;
        stopLab(false);
        panel.style.setProperty("--lsn-rgb", "var(" + LESSONS[n - 1].rgb + ")");
        parts.article.innerHTML = articleHTML(n);
        parts.toc.innerHTML = tocHTML(n);
        reader.cleanupLab = mountLab(n, ref(parts.article, "lab"));
        renderCheck();
    }

    // Previous / next buttons. After the last lesson, "next" becomes "Finish".
    function setNavButton(button, target, kind) {
        const exists = target >= 1 && target <= TOTAL;
        const isFinish = kind === "next" && !exists;
        button.setAttribute("aria-disabled", String(!exists && !isFinish));
        button.classList.toggle("is-finish", isFinish);
        button.querySelector(".lsn-nav-small").textContent = t(isFinish ? "lessons.reader.finish" : "lessons.reader." + kind);
        button.querySelector(".lsn-nav-title").textContent = exists ? lessonTitle(target) : isFinish ? t("lessons.reader.finishTitle") : "";
        if (exists) button.setAttribute("aria-label", t("lessons.reader." + kind + "Label", { title: lessonTitle(target) }));
        else button.setAttribute("aria-label", t(isFinish ? "lessons.reader.finishLabel" : "lessons.reader.firstLesson"));
    }

    // Everything around the text: top bar, buttons, labels
    function updateReaderChrome() {
        const n = reader.lesson;
        if (!n) return;
        const isDone = completed.has(n);

        parts.crumb.textContent = t("lessons.reader.crumb", { n: pad(n), total: pad(TOTAL) });
        parts.keys.textContent = t("lessons.reader.keys");
        parts.tocTitle.textContent = t("lessons.reader.toc");
        parts.close.setAttribute("aria-label", t("lessons.reader.close"));
        parts.close.title = t("lessons.reader.close");

        parts.listen.hidden = !canSpeak;
        parts.listen.classList.toggle("is-on", speech.active);
        parts.listen.title = t("lessons.reader.listenLabel");
        parts.listenText.textContent = t(speech.active ? "lessons.reader.stop" : "lessons.reader.listen");

        const sizeLabel = t("lessons.reader.textSize", { size: t("lessons.reader.size." + textSize) });
        parts.size.setAttribute("aria-label", sizeLabel);
        parts.size.title = sizeLabel;

        setNavButton(parts.prev, n - 1, "prev");
        setNavButton(parts.next, n + 1, "next");

        // When the lesson is done, the button says so and shows a visible "Undo",
        // so nobody un-completes a lesson by accident without knowing it
        parts.complete.classList.toggle("is-done", isDone);
        if (isDone) {
            parts.completeText.innerHTML = '<span aria-hidden="true">✓</span> ' + esc(t("lessons.reader.completed")) +
                '<span class="lsn-complete-undo"><span aria-hidden="true">↩</span> ' + esc(t("lessons.reader.undo")) + "</span>";
            parts.complete.setAttribute("aria-label", t("lessons.reader.undoLabel"));
        } else {
            parts.completeText.textContent = t("lessons.reader.complete");
            parts.complete.removeAttribute("aria-label");
        }
        const chip = ref(parts.article, "doneChip");
        if (chip) chip.hidden = !isDone;
    }

    // Reading progress bar + highlight of the current part in the list ("scroll spy").
    // After a click in the list, the clicked part is the current one until that scroll
    // has ended: a short part near the end can't reach the top, so the spy alone
    // would pick the part below it.
    let scrollFrame = 0;
    const spy = { held: false, hold: 0, timer: 0, target: 0 };

    function markCurrentPart(name) {
        parts.toc.querySelectorAll("[data-goto]").forEach(function (link) {
            if (link.getAttribute("data-goto") === name) link.setAttribute("aria-current", "true");
            else link.removeAttribute("aria-current");
        });
    }

    function onReaderScroll() {
        const box = parts.scroll;
        const max = box.scrollHeight - box.clientHeight;
        const ratio = max > 0 ? Math.min(1, box.scrollTop / max) : 1;
        reader.scrollRatio = ratio;
        parts.progress.style.transform = "scaleX(" + ratio.toFixed(4) + ")";
        if (spy.held) return;

        // The current part is the last one whose top is above 35% of the box
        const limit = box.getBoundingClientRect().top + box.clientHeight * 0.35;
        const sections = parts.article.querySelectorAll("[data-part]");
        let active = sections.length ? sections[0].getAttribute("data-part") : "";
        sections.forEach(function (section) {
            if (section.getBoundingClientRect().top <= limit) active = section.getAttribute("data-part");
        });
        if (ratio > 0.985 && sections.length) active = sections[sections.length - 1].getAttribute("data-part");
        markCurrentPart(active);
    }

    // The hold ends when the scroll ends ("scrollend"; browsers without it: when the
    // scroll events stop), or as soon as you scroll yourself with the wheel or a finger.
    // If the reader is somewhere else by then, the spy takes over again at once.
    const HAS_SCROLLEND = "onscrollend" in window;

    function holdSpy(target) {
        spy.held = true;
        spy.hold += 1;
        spy.target = target;
        waitForScrollEnd(HAS_SCROLLEND ? 3000 : 1000);
    }

    // A safety net in case the end of the scroll is never reported
    function waitForScrollEnd(wait) {
        clearTimeout(spy.timer);
        spy.timer = setTimeout(endHold, wait);
    }

    // Lets go one frame later, so the frame that is already waiting for the last
    // scroll event still sees the hold
    function endHold() {
        if (!spy.held) return;
        const hold = spy.hold;
        clearTimeout(spy.timer);
        requestAnimationFrame(function () {
            if (!spy.held || spy.hold !== hold) return;   // a newer click holds it now
            spy.held = false;
            if (Math.abs(parts.scroll.scrollTop - spy.target) > 4) onReaderScroll();
        });
    }

    function releaseSpy() {
        clearTimeout(spy.timer);
        spy.held = false;
    }

    parts.scroll.addEventListener("scroll", function () {
        if (spy.held) waitForScrollEnd(HAS_SCROLLEND ? 3000 : 250);
        if (scrollFrame) return;
        scrollFrame = requestAnimationFrame(function () {
            scrollFrame = 0;
            onReaderScroll();
        });
    }, { passive: true });
    parts.scroll.addEventListener("scrollend", endHold);
    parts.scroll.addEventListener("wheel", endHold, { passive: true });
    parts.scroll.addEventListener("touchstart", endHold, { passive: true });

    function goToPart(name) {
        const target = parts.article.querySelector('[data-part="' + name + '"]');
        if (!target) return;
        const box = parts.scroll;
        const top = target.getBoundingClientRect().top - box.getBoundingClientRect().top + box.scrollTop - 18;
        markCurrentPart(name);
        holdSpy(A.util.clamp(top, 0, box.scrollHeight - box.clientHeight));
        box.scrollTo({ top: top, behavior: A.motion.ok() ? "smooth" : "auto" });
        const heading = target.querySelector("[tabindex='-1']");
        if (heading) heading.focus({ preventScroll: true });
    }

    // Shows lesson n in the (already open) reader
    function showLesson(n) {
        stopSpeaking();
        stopLab(true);
        reader.lesson = n;
        renderLessonContent();
        updateReaderChrome();
        releaseSpy();
        parts.scroll.scrollTop = 0;
        onReaderScroll();
        setHash("#lesson-" + n);
        if (A.motion.ok()) A.dom.replay(parts.article, "is-entering");   // the fade-in
        const title = parts.article.querySelector("#lsn-reader-title");
        if (title) title.focus({ preventScroll: true });
    }

    function goRelative(step) {
        const target = reader.lesson + step;
        if (target >= 1 && target <= TOTAL) showLesson(target);
    }

    function toggleComplete() {
        setCompleted(reader.lesson, !completed.has(reader.lesson));
        renderCheck();
    }

    function cycleTextSize() {
        textSize = SIZES[(SIZES.indexOf(textSize) + 1) % SIZES.length];
        A.storage.set("lessons.textSize", textSize);
        readerEl.setAttribute("data-size", textSize);
        updateReaderChrome();
        onReaderScroll();
    }

    // "Try it on this site": close the reader and jump to the right place
    function runTryIt() {
        const target = LESSONS[reader.lesson - 1].tryIt;
        closeReader({ restoreFocus: false });
        requestAnimationFrame(function () {
            const sectionId = target === "classifier" || target === "predictor" ? "lab" : target;
            A.dom.focusHeading(sectionId);   // the focus waits there if the feature moves it nowhere
            if (sectionId === "lab" && A.lab) A.lab.open(target);
            else if (sectionId === "quiz" && A.quiz) A.quiz.start();
            else A.navigate(sectionId);
        });
    }

    function setHash(hash) {
        try {
            history.replaceState(history.state, "", hash || window.location.pathname + window.location.search);
        } catch (error) {}
    }

    function scrollCardIntoView(n) {
        const card = document.getElementById("lesson-card-" + n);
        if (!card) return;
        const box = card.getBoundingClientRect();
        const top = window.scrollY + box.top - Math.max(0, (window.innerHeight - box.height) / 2);
        window.scrollTo({ top: Math.max(0, top), behavior: "instant" });
    }

    // Can the keyboard focus go back to this element when the reader closes?
    function canTakeFocus(element) {
        return Boolean(element && element.isConnected && typeof element.focus === "function" &&
            element !== document.body && element !== document.documentElement &&
            !readerEl.contains(element) && !element.closest("[inert], [hidden]") &&
            element.getClientRects().length > 0);
    }

    function openLesson(number, opener) {
        const n = Number(number);
        if (!Number.isInteger(n) || n < 1 || n > TOTAL) return;
        if (reader.open) {
            if (n !== reader.lesson) showLesson(n);
            return;
        }
        clearTimeout(reader.closeTimer);
        reader.open = true;
        reader.opener = canTakeFocus(opener) ? opener : null;
        // Without a button to come back to, closing returns to the lesson's card
        if (!reader.opener) scrollCardIntoView(n);
        const hash = window.location.hash;
        reader.previousHash = /^#lesson-\d+$/.test(hash) ? "" : hash;

        document.body.classList.add("lsn-reading");
        readerEl.hidden = false;
        readerEl.classList.remove("is-closing");
        A.dom.replay(readerEl, "is-open");   // the opening animation starts from the beginning
        overlay.opened();            // before the focus moves into the reader
        showLesson(n);
    }

    // options.restoreFocus = false: another part of the page takes the focus
    // options.keepHash = true: leave the address bar alone (the Back button changed it)
    function closeReader(options) {
        if (!reader.open) return;
        const settings = options || {};
        reader.open = false;
        stopSpeaking();
        stopLab(true);
        releaseSpy();
        readerEl.classList.remove("is-open");
        document.body.classList.remove("lsn-reading");
        overlay.closed();            // before the focus goes back to the page
        if (!settings.keepHash) setHash(reader.previousHash);

        const finish = function () {
            readerEl.hidden = true;
            readerEl.classList.remove("is-closing");
        };
        if (!A.motion.ok()) {
            finish();
        } else {
            readerEl.classList.add("is-closing");
            reader.closeTimer = setTimeout(finish, 260);
        }

        if (settings.restoreFocus !== false) {
            // Back to the button that opened the reader. If there is none, go to the
            // card of the lesson you were reading (scrolled into view, so the focus ring is visible).
            if (canTakeFocus(reader.opener)) {
                reader.opener.focus({ preventScroll: true });
            } else {
                const card = mount.querySelector("#lesson-card-" + reader.lesson + " [data-open]");
                if (card) {
                    scrollCardIntoView(reader.lesson);
                    card.focus({ preventScroll: true });
                }
            }
        }
    }

    // ----- Clicks and keys inside the reader -----
    // A click on the backdrop around the panel closes the reader, but only when the
    // press also started there, and not as the second click of a double-click
    // (the first click may have opened the reader from a lesson card under it).
    let pressOnBackdrop = false;
    readerEl.addEventListener("pointerdown", function (event) {
        pressOnBackdrop = event.target === parts.backdrop;
    });

    readerEl.addEventListener("click", function (event) {
        const target = event.target.closest("[data-action], [data-option], [data-goto]");
        if (!target || !readerEl.contains(target)) return;
        if (target.getAttribute("aria-disabled") === "true") return;
        if (target === parts.backdrop && (!pressOnBackdrop || event.detail > 1)) return;

        if (target.hasAttribute("data-option")) {
            answerCheck(Number(target.getAttribute("data-option")));
            return;
        }
        if (target.hasAttribute("data-goto")) {
            goToPart(target.getAttribute("data-goto"));
            return;
        }
        switch (target.getAttribute("data-action")) {
            case "close": closeReader(); break;
            case "prev": goRelative(-1); break;
            case "next":
                if (reader.lesson === TOTAL) closeReader();
                else goRelative(1);
                break;
            case "complete": toggleComplete(); break;
            case "listen":
                if (speech.active) stopSpeaking();
                else startSpeaking();
                break;
            case "size": cycleTextSize(); break;
            case "try": runTryIt(); break;
            case "retry": retryCheck(); break;
        }
    });

    // ← and → go to the previous / next lesson. (Esc and Tab are handled by core.)
    document.addEventListener("keydown", function (event) {
        if (!reader.open || A.overlays.top() !== READER_ID) return;
        if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;
        if (event.altKey || event.ctrlKey || event.metaKey || event.shiftKey) return;
        // Only when the focus is in the reader (or lost on the page body),
        // and never while typing or moving a slider
        const target = event.target;
        if (!readerEl.contains(target) && target !== document.body && target !== document.documentElement) return;
        const tag = target.tagName;
        if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT" || target.isContentEditable) return;
        event.preventDefault();
        goRelative(event.key === "ArrowLeft" ? -1 : 1);
    });

    // ---------- 25. Reading aloud (the browser's built-in speech) ----------
    const canSpeak = "speechSynthesis" in window && typeof window.SpeechSynthesisUtterance === "function";
    const speech = { active: false, session: 0, element: null, warnedAt: 0 };

    function markSpeaking(element) {
        if (speech.element) speech.element.classList.remove("is-speaking");
        speech.element = element;
        if (!element) return;
        element.classList.add("is-speaking");
        const box = parts.scroll.getBoundingClientRect();
        const rect = element.getBoundingClientRect();
        if (rect.top < box.top + 40 || rect.bottom > box.bottom - 40) {
            element.scrollIntoView({ block: "center", behavior: A.motion.ok() ? "smooth" : "auto" });
        }
    }

    function stopSpeaking() {
        if (!canSpeak) return;
        const wasActive = speech.active;
        speech.active = false;
        speech.session += 1;
        if (wasActive) window.speechSynthesis.cancel();
        markSpeaking(null);
        if (reader.lesson) updateReaderChrome();
    }

    function startSpeaking() {
        if (!canSpeak) return;
        stopSpeaking();
        window.speechSynthesis.cancel();

        // Split the lesson into sentences: short pieces are read more reliably
        const chunks = [];
        parts.article.querySelectorAll("[data-speak]").forEach(function (element) {
            const text = element.textContent.replace(/\s+/g, " ").trim();
            (text.match(/[^.!?…]+[.!?…]*["»”)]*\s*/g) || [text]).forEach(function (sentence) {
                if (sentence.trim()) chunks.push({ element: element, text: sentence.trim() });
            });
        });

        const langCode = A.lang === "ru" ? "ru" : "en";
        const voice = window.speechSynthesis.getVoices().filter(function (item) {
            return item.lang && item.lang.toLowerCase().indexOf(langCode) === 0;
        })[0] || null;

        speech.active = true;
        speech.session += 1;
        const session = speech.session;
        let index = 0;
        let started = false;

        function next() {
            if (session !== speech.session) return;
            if (index >= chunks.length) {
                stopSpeaking();
                return;
            }
            const chunk = chunks[index];
            index += 1;
            markSpeaking(chunk.element);
            const utterance = new window.SpeechSynthesisUtterance(chunk.text);
            utterance.lang = langCode === "ru" ? "ru-RU" : "en-US";
            if (voice) utterance.voice = voice;
            utterance.onstart = function () { started = true; };
            utterance.onend = next;
            utterance.onerror = function (event) {
                if (session !== speech.session) return;
                if (event.error === "interrupted" || event.error === "canceled") return;
                stopSpeaking();
                // Only warn once every few seconds, even if the button is pressed again
                if (!started && Date.now() - speech.warnedAt > 5000) {
                    speech.warnedAt = Date.now();
                    A.toast(t("lessons.reader.noSpeech"), "🔇");
                }
            };
            window.speechSynthesis.speak(utterance);
        }

        next();
        updateReaderChrome();
    }

    // ---------- 26. Commands for the Ctrl+K palette + API for other features ----------
    LESSONS.forEach(function (lesson) {
        A.registerCommand({
            id: "lesson-" + lesson.number,
            group: "lessons.cmdGroup",
            icon: lesson.icon,
            title: function () { return t("lessons.cmdOpen", { title: lessonTitle(lesson.number) }); },
            keywords: "lesson урок " + lesson.number + " " + lesson.keywords,
            // An open reader stays open and switches to this lesson
            keepOverlays: ["lesson-reader"],
            // The palette gives the focus back before running a command, so the
            // focused element is where the reader returns to when it closes
            run: function () { openLesson(lesson.number, document.activeElement); }
        });
    });

    A.registerCommand({
        id: "lessons-continue",
        group: "lessons.cmdGroup",
        icon: "▶️",
        title: function () { return t("lessons.cmdContinue"); },
        keywords: "continue next lesson learning продолжить следующий урок обучение",
        keepOverlays: ["lesson-reader"],
        run: function () { openLesson(nextLesson() || 1, document.activeElement); }
    });

    // Other features use AICompass.lessons (AICompass.openLesson and closeLesson are
    // older names). Closing the reader brings the focus back to "opener": the button
    // they used (by default, whatever has the focus).
    A.feature("lessons", {
        count: TOTAL,
        // [{ number, icon, title(), description() }] in order
        list: function () {
            return LESSONS.map(function (lesson) {
                return {
                    number: lesson.number,
                    icon: lesson.icon,
                    title: function () { return lessonTitle(lesson.number); },
                    description: function () { return t(lessonKey(lesson.number, "desc")); }
                };
            });
        },
        title: function (number) {
            return number >= 1 && number <= TOTAL ? lessonTitle(number) : "";
        },
        // The numbers of the finished lessons, smallest first
        completed: function () {
            return Array.from(completed).sort(function (a, b) { return a - b; });
        },
        isCompleted: function (number) { return completed.has(number); },
        // The first lesson that is not finished yet (0 when all are)
        next: nextLesson,
        open: function (number, opener) {
            openLesson(number, opener || document.activeElement);
        },
        close: function () { closeReader({ restoreFocus: false }); },
        isOpen: function () { return reader.open; }
    });

    A.openLesson = A.lessons.open;
    A.closeLesson = A.lessons.close;

    // ---------- 27. Language and theme changes ----------
    A.onLanguageChange(function () {
        updateHUD();
        updateCards();
        if (!cert.root.hidden) drawCertificate();
        // Core also sends this event once when the page starts: nothing to redo then
        if (!reader.open || reader.renderedLang === A.lang) return;

        // Re-draw the open lesson in the new language, keeping its place, answers and focus
        const ratio = reader.scrollRatio;
        const active = document.activeElement;
        const focusWasInside = Boolean(active) && readerEl.contains(active);
        const fid = focusWasInside ? active.getAttribute("data-fid") : null;
        stopSpeaking();
        renderLessonContent();
        updateReaderChrome();
        const box = parts.scroll;
        box.scrollTop = ratio * (box.scrollHeight - box.clientHeight);
        onReaderScroll();
        if (focusWasInside && !active.isConnected) {
            const again = fid ? readerEl.querySelector('[data-fid="' + fid + '"]') : null;
            const target = again || parts.article.querySelector("#lsn-reader-title");
            if (target) target.focus({ preventScroll: true });
        }
    });

    A.onThemeChange(function () {
        scheduleCertificate();
    });

    // Fonts arrive a little later: redraw the certificate with them
    if (document.fonts && document.fonts.ready) {
        document.fonts.ready.then(scheduleCertificate);
    }

    // ---------- 28. Start ----------
    updateHUD();
    updateCards();

    // A link like index.html#lesson-3 opens that lesson (0: the address names no lesson)
    function lessonFromHash() {
        const match = /^#lesson-(\d+)$/.exec(window.location.hash);
        const n = match ? Number(match[1]) : 0;
        return n >= 1 && n <= TOTAL ? n : 0;
    }

    // The Back / Forward buttons change the hash: open the lesson, or close the reader
    window.addEventListener("hashchange", function () {
        const n = lessonFromHash();
        if (n) openLesson(n, document.activeElement);
        else if (reader.open) closeReader({ keepHash: true });
    });

    // Opened once every script has run, so the whole page (and every
    // command of the Ctrl+K palette) is ready behind the reader
    A.ready(function () {
        const n = lessonFromHash();
        if (n) openLesson(n);
    });
})();
