/* Rubia da Rocha Valente — site behavior.
   Everything here is progressive enhancement: with JS off, every
   publication is visible and the filter controls stay hidden. */
(function () {
  "use strict";

  /* ── theme ─────────────────────────────────────────────── */
  var root = document.documentElement;
  var btn = document.querySelector("[data-theme-toggle]");

  function store(k, v) { try { localStorage.setItem(k, v); } catch (e) {} }

  if (btn) {
    btn.addEventListener("click", function () {
      var dark = root.dataset.theme
        ? root.dataset.theme === "dark"
        : matchMedia("(prefers-color-scheme: dark)").matches;
      root.dataset.theme = dark ? "light" : "dark";
      store("theme", root.dataset.theme);
    });
  }

  /* ── publication filters ───────────────────────────────── */
  var panel = document.querySelector("[data-filters]");
  var list = document.querySelector("[data-pubs]");
  if (!panel || !list) return;

  panel.hidden = false;

  var items = Array.prototype.slice.call(list.querySelectorAll(".pub"));
  var bars = Array.prototype.slice.call(panel.querySelectorAll("[data-year]"));
  var chips = Array.prototype.slice.call(panel.querySelectorAll("[data-topic]"));
  var countEl = panel.querySelector("[data-count]");
  var emptyEl = document.querySelector("[data-empty]");
  var resets = Array.prototype.slice.call(document.querySelectorAll("[data-reset]"));

  var year = null;
  var topics = [];

  items.forEach(function (el) {
    el.dataset.topicList = " " + (el.dataset.topics || "") + " ";
  });

  function matches(el) {
    if (year !== null && Number(el.dataset.year) !== year) return false;
    if (!topics.length) return true;
    return topics.some(function (t) {
      return el.dataset.topicList.indexOf(" " + t + " ") !== -1;
    });
  }

  function apply() {
    var shown = 0;
    var lastYear = null;
    var perYear = {};

    items.forEach(function (el) {
      var ok = matches(el);
      el.hidden = !ok;
      if (!ok) return;
      shown++;
      perYear[el.dataset.year] = (perYear[el.dataset.year] || 0) + 1;
      // The year gutter only labels the first entry of each run, so it has
      // to be recomputed against what is actually visible.
      var y = el.dataset.year;
      el.classList.toggle("pub--newyear", y !== lastYear);
      lastYear = y;
    });

    if (countEl) countEl.textContent = String(shown);
    if (emptyEl) emptyEl.hidden = shown !== 0;
    list.hidden = shown === 0;

    var active = year !== null || topics.length > 0;
    resets.forEach(function (r) {
      if (r.closest("[data-empty]")) return;
      r.hidden = !active;
    });

    // The histogram is the filter's readout as well as its control: bars shrink
    // to the matching subset, the pale track behind them keeps the full count.
    bars.forEach(function (b) {
      b.setAttribute("aria-pressed", String(Number(b.dataset.year) === year));
      var total = Number(b.dataset.total) || 0;
      var hit = perYear[b.dataset.year] || 0;
      var fill = b.querySelector(".axis__fill");
      var num = b.querySelector(".axis__n");
      if (fill) fill.style.height = (total ? (hit / total) * 100 : 0) + "%";
      if (num) num.textContent = String(hit);
      b.title = hit + " of " + total + " in " + b.dataset.year;
    });
    chips.forEach(function (c) {
      var on = c.dataset.topic === "all"
        ? topics.length === 0
        : topics.indexOf(c.dataset.topic) !== -1;
      c.classList.toggle("is-on", on);
      c.setAttribute("aria-pressed", String(on));
    });
  }

  bars.forEach(function (b) {
    b.addEventListener("click", function () {
      var y = Number(b.dataset.year);
      year = year === y ? null : y;
      apply();
    });
  });

  chips.forEach(function (c) {
    c.addEventListener("click", function () {
      var t = c.dataset.topic;
      if (t === "all") {
        topics = [];
      } else {
        var i = topics.indexOf(t);
        if (i === -1) topics.push(t); else topics.splice(i, 1);
      }
      apply();
    });
  });

  resets.forEach(function (r) {
    r.addEventListener("click", function () {
      year = null;
      topics = [];
      apply();
      panel.scrollIntoView({ block: "nearest" });
    });
  });

  apply();
})();
