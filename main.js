const services = [
  {
    name: "Home Cleaning",
    description: "Regular residential cleaning that keeps your home fresh and comfortable. We handle the work so you can focus on what matters most.",
    url: "home-cleaning.html",
    image: "images/hero-service-1.jpg",
    alt: "Home cleaning services in Salina, Kansas — Pro Cleaning Services"
  },
  {
    name: "Move In / Move Out",
    description: "Thorough cleaning for moves, landlords, and property managers. We leave every space spotless for the next chapter.",
    url: "move-in-move-out.html",
    image: "images/hero-service-2.jpg",
    alt: "Move in move out cleaning in Salina, Kansas — Pro Cleaning Services"
  },
  {
    name: "Deep Cleaning",
    description: "A top-to-bottom clean that goes beyond the surface — baseboards, inside appliances, and every corner that regular visits miss.",
    url: "deep-cleaning.html",
    image: "images/hero-service-3.jpg",
    alt: "Deep cleaning services in Salina, Kansas — Pro Cleaning Services"
  },
  {
    name: "Germ Prevention",
    description: "Professional disinfection and sanitizing to protect your home or office from bacteria, viruses, and illness.",
    url: "germ-prevention.html",
    image: "images/hero-service-4.jpg",
    alt: "Germ prevention and disinfection in Salina, Kansas — Pro Cleaning Services"
  }
];

function renderServices(containerId) {
  const container = document.getElementById(containerId);
  if (!container) return;
  container.innerHTML = services.map(s => `
    <article class="service-card">
      <div class="service-media">
        <img src="${s.image}" alt="${s.alt}" loading="lazy" width="640" height="420">
      </div>
      <h3>${s.name}</h3>
      <p>${s.description}</p>
      <a class="btn btn-outline" href="${s.url}">Learn More</a>
    </article>
  `).join('');
}

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
  renderServices('serviceGrid');
  initNav();
  initScrollTop();
  initYear();
});
