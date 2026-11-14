// Gatien Caillet, portfolio.
// Photo des Alpes en fond de l'accueil et du contact, parallaxe douce, et nav qui s'adapte au fond.

const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const hero = document.getElementById("top");
const contact = document.getElementById("contact");
const nav = document.getElementById("nav");

const photos = [...document.querySelectorAll(".bg-photo")].map((img) => ({
  img,
  section: img.parentElement,
}));

// Parallaxe : la photo glisse un peu moins vite que la page.
function parallax() {
  const vh = window.innerHeight;
  for (const { img, section } of photos) {
    const r = section.getBoundingClientRect();
    if (r.bottom < 0 || r.top > vh) continue;
    img.style.transform = `translate3d(0, ${(-r.top * 0.25).toFixed(1)}px, 0)`;
  }
}

// Nav : fond au scroll, texte clair au-dessus des photos.
function updateNav() {
  nav.classList.toggle("is-scrolled", window.scrollY > 24);
  const onHero = hero.getBoundingClientRect().bottom > nav.offsetHeight;
  const c = contact.getBoundingClientRect();
  const onContact = c.top <= nav.offsetHeight + 80 && c.bottom > 0;
  nav.classList.toggle("is-dark", onHero || onContact);
}

let ticking = false;
function onScroll() {
  if (ticking) return;
  ticking = true;
  requestAnimationFrame(() => {
    if (!reduceMotion) parallax();
    updateNav();
    ticking = false;
  });
}
window.addEventListener("scroll", onScroll, { passive: true });
window.addEventListener("resize", onScroll);
onScroll();
