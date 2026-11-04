(function () {
  'use strict';

  var root = document.documentElement;
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  root.classList.add('js');

  function ready(fn) {
    if (document.readyState !== 'loading') { fn(); } else { document.addEventListener('DOMContentLoaded', fn); }
  }

  function initTheme() {
    var btn = document.getElementById('themeToggle');
    var stored = null;
    try { stored = localStorage.getItem('theme'); } catch (e) {}
    var dark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    apply(stored || (dark ? 'dark' : 'light'));

    function apply(theme) {
      root.setAttribute('data-theme', theme);
      var meta = document.querySelector('meta[name="theme-color"]');
      if (meta) { meta.setAttribute('content', theme === 'dark' ? '#141714' : '#f6f3ec'); }
      if (btn) {
        btn.setAttribute('aria-pressed', String(theme === 'dark'));
        btn.setAttribute('aria-label', theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode');
      }
    }
    if (btn) {
      btn.addEventListener('click', function () {
        var next = root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
        apply(next);
        try { localStorage.setItem('theme', next); } catch (e) {}
      });
    }
  }

  function initNav() {
    var toggle = document.getElementById('menuToggle');
    var nav = document.getElementById('nav');
    if (!toggle || !nav) { return; }
    function setOpen(open) {
      nav.classList.toggle('open', open);
      toggle.setAttribute('aria-expanded', String(open));
      toggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    }
    toggle.addEventListener('click', function () { setOpen(!nav.classList.contains('open')); });
    nav.addEventListener('click', function (e) { if (e.target.closest('a')) { setOpen(false); } });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && nav.classList.contains('open')) { setOpen(false); toggle.focus(); }
    });
    window.addEventListener('resize', function () { if (window.innerWidth > 900) { setOpen(false); } });
  }

  function initScrollUi() {
    var header = document.querySelector('.site-header');
    var toTop = document.getElementById('toTop');
    var links = Array.prototype.slice.call(document.querySelectorAll('.nav a'));
    var sections = links.map(function (a) { return document.querySelector(a.getAttribute('href')); });

    function onScroll() {
      var y = window.scrollY;
      if (header) { header.classList.toggle('scrolled', y > 10); }
      if (toTop) { toTop.classList.toggle('show', y > 700); }
      var current = -1;
      sections.forEach(function (s, i) { if (s && s.getBoundingClientRect().top <= 140) { current = i; } });
      links.forEach(function (a, i) {
        if (i === current) { a.classList.add('active'); a.setAttribute('aria-current', 'true'); }
        else { a.classList.remove('active'); a.removeAttribute('aria-current'); }
      });
    }
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();

    if (toTop) {
      toTop.addEventListener('click', function () {
        window.scrollTo({ top: 0, behavior: reduce ? 'auto' : 'smooth' });
      });
    }
  }

  function animateCount(el) {
    var target = parseInt(el.getAttribute('data-count'), 10);
    if (isNaN(target)) { return; }
    if (reduce) { el.textContent = target; return; }
    var duration = 1400;
    var start = null;
    function step(ts) {
      if (start === null) { start = ts; }
      var p = Math.min((ts - start) / duration, 1);
      var eased = 1 - Math.pow(1 - p, 3);
      el.textContent = Math.round(target * eased);
      if (p < 1) { requestAnimationFrame(step); } else { el.textContent = target; }
    }
    requestAnimationFrame(step);
  }

  function initReveal() {
    var items = document.querySelectorAll('.reveal');
    var counters = document.querySelectorAll('[data-count]');
    if (reduce || !('IntersectionObserver' in window)) {
      items.forEach(function (el) { el.classList.add('in'); });
      return;
    }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) { entry.target.classList.add('in'); io.unobserve(entry.target); }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
    items.forEach(function (el) { io.observe(el); });

    var co = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) { animateCount(entry.target); co.unobserve(entry.target); }
      });
    }, { threshold: 0.6 });
    counters.forEach(function (el) { el.textContent = '0'; co.observe(el); });
  }

  function initCopy() {
    var btn = document.getElementById('copyEmail');
    var status = document.getElementById('copyStatus');
    if (!btn) { return; }
    var label = btn.textContent;
    function done(ok) {
      btn.textContent = ok ? 'Copied!' : 'Press Ctrl+C to copy';
      if (status) { status.textContent = ok ? 'Email address copied to clipboard' : 'Copy failed'; }
      setTimeout(function () { btn.textContent = label; }, 2000);
    }
    function fallback(text) {
      var ta = document.createElement('textarea');
      ta.value = text;
      ta.setAttribute('readonly', '');
      ta.style.position = 'fixed';
      ta.style.opacity = '0';
      document.body.appendChild(ta);
      ta.select();
      var ok = false;
      try { ok = document.execCommand('copy'); } catch (e) {}
      document.body.removeChild(ta);
      done(ok);
    }
    btn.addEventListener('click', function () {
      var text = btn.getAttribute('data-email');
      if (navigator.clipboard && window.isSecureContext) {
        navigator.clipboard.writeText(text).then(function () { done(true); }, function () { fallback(text); });
      } else { fallback(text); }
    });
  }

  ready(function () {
    var year = document.getElementById('year');
    if (year) { year.textContent = new Date().getFullYear(); }
    initTheme();
    initNav();
    initScrollUi();
    initReveal();
    initCopy();
  });
})();
