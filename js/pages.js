/* =========================================================
   AI COMPASS — THE FEW BUTTONS OF THE PLAIN PAGES
   The pages that search engines read (lessons/, glossary/, path/,
   teachers/...; written by tools/build-pages.js) work without any
   script. This small file only makes them livelier:
   - a question: click an answer to see whether it is right, and why;
   - "Share": the phone's share window, or the link copied;
   - "Print" on the lesson plans.
   It has nothing to do with the app (index.html), and saves nothing.
   ========================================================= */

(function () {
    "use strict";

    // ---------- 1. Questions ----------
    // <div class="pg-quiz"> has the answers as buttons (the right one has data-right)
    // and the explanation in <details>. One try: the answer is marked, the right one
    // is shown, and the explanation opens.
    document.addEventListener("click", function (event) {
        var button = event.target.closest ? event.target.closest(".pg-options button") : null;
        if (!button) return;
        var quiz = button.closest(".pg-quiz");
        if (!quiz || quiz.classList.contains("is-answered")) return;
        quiz.classList.add("is-answered");
        var isRight = button.hasAttribute("data-right");
        button.classList.add(isRight ? "is-right" : "is-wrong");
        Array.prototype.forEach.call(quiz.querySelectorAll(".pg-options button"), function (other) {
            if (other.hasAttribute("data-right")) other.classList.add("is-right");
            other.setAttribute("aria-disabled", "true");
        });
        var why = quiz.querySelector("details");
        if (why) why.open = true;
    });

    // ---------- 2. Share and Print ----------
    // The buttons are hidden in the page and shown here, where they can work.
    function pageAddress() {
        var canonical = document.querySelector('link[rel="canonical"]');
        return canonical && canonical.href ? canonical.href : window.location.href;
    }

    function copy(text) {
        if (navigator.clipboard && typeof navigator.clipboard.writeText === "function") {
            return navigator.clipboard.writeText(text);
        }
        return Promise.reject(new Error("No clipboard"));
    }

    Array.prototype.forEach.call(document.querySelectorAll("[data-share]"), function (button) {
        var canShare = typeof navigator.share === "function";
        var canCopy = Boolean(navigator.clipboard && typeof navigator.clipboard.writeText === "function");
        if (!canShare && !canCopy) return;
        var label = button.textContent;
        button.hidden = false;
        button.addEventListener("click", function () {
            var data = { title: document.title, url: pageAddress() };
            var done = function () {
                button.textContent = "✓ " + button.getAttribute("data-done");
                setTimeout(function () { button.textContent = label; }, 2500);
            };
            if (canShare) {
                // (closing the share window is not an error; anything else: copy instead)
                navigator.share(data).catch(function (error) {
                    if (error && error.name === "AbortError") return;
                    copy(data.url).then(done, function () {});
                });
            } else {
                copy(data.url).then(done, function () {});
            }
        });
    });

    Array.prototype.forEach.call(document.querySelectorAll("[data-print]"), function (button) {
        if (typeof window.print !== "function") return;
        button.hidden = false;
        button.addEventListener("click", function () { window.print(); });
    });
})();
