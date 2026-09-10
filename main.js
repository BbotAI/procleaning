// CACHE NOTE, 2026-09-09: this file is linked as main.js?v=N and Cloudflare
// caches each versioned URL for four hours. v=2 was skipped because it was
// requested repeatedly while the deploy was still landing, which cached the
// PRE-deploy file under that exact URL: the site kept serving four service
// cards even though origin had five. Never poll a versioned asset URL while
// waiting for a deploy. If it happens, bump to the next N rather than waiting
// out the TTL — a URL nobody has requested goes straight to origin.
// The services array and renderServices() lived here until 2026-09-09. The
// homepage now carries its service cards as real HTML, so a crawler sees the
// links and a service cannot be added to the site while silently missing from
// the homepage, which is what happened to Odor Removal. Edit index.html and
// services.html; there is no longer a second copy of this list in JavaScript.

function initNav() {
  const toggle = document.getElementById('navToggle');
  const nav    = document.getElementById('nav');
  if (!toggle || !nav) return;

  toggle.addEventListener('click', function () {
    const isOpen = nav.classList.toggle('nav--open');
    toggle.setAttribute('aria-expanded', isOpen);
    toggle.textContent = isOpen ? '✕' : '☰';
  });

  nav.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      nav.classList.remove('nav--open');
      toggle.setAttribute('aria-expanded', 'false');
      toggle.textContent = '☰';
    });
  });

  document.addEventListener('click', function (e) {
    if (!nav.contains(e.target) && !toggle.contains(e.target)) {
      nav.classList.remove('nav--open');
      toggle.setAttribute('aria-expanded', 'false');
      toggle.textContent = '☰';
    }
  });
}

function initScrollTop() {
  const btn = document.getElementById('scrollTop');
  if (!btn) return;
  window.addEventListener('scroll', () => btn.classList.toggle('visible', window.scrollY > 400));
  btn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
}

function initYear() {
  const y = document.getElementById('year');
  if (y) y.textContent = new Date().getFullYear();
}

document.addEventListener('DOMContentLoaded', function () {
  initNav();
  initScrollTop();
  initYear();
});
