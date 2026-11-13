// Gatien Caillet, portfolio.
// Montagnes générées en SVG avec parallaxe douce, et nav qui s'adapte au fond.


const SVG_NS = "http://www.w3.org/2000/svg";
const W = 1600;
const H = 900;
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

// PRNG déterministe : les montagnes sont identiques à chaque visite.
function mulberry32(seed) {
  return function () {
    seed |= 0; seed = (seed + 0x6D2B79F5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// Crête par déplacement du point médian.
function ridgePoints(seed, baseY, amp, roughness) {
  const rand = mulberry32(seed);
  const n = 256;
  const pts = new Array(n + 1);
  pts[0] = baseY + (rand() - 0.5) * amp;
  pts[n] = baseY + (rand() - 0.5) * amp;
  let step = n;
  let scale = amp;
  while (step > 1) {
    const half = step / 2;
    for (let i = half; i < n; i += step) {
      pts[i] = (pts[i - half] + pts[i + half]) / 2 + (rand() - 0.5) * scale;
    }
    step = half;
    scale *= roughness;
  }
  return pts;
}

function ridgePath(pts) {
  const n = pts.length - 1;
  const dx = (W + 200) / n;
  let d = `M -100 ${H + 50} L -100 ${pts[0].toFixed(1)}`;
  for (let i = 1; i <= n; i++) d += ` L ${(-100 + i * dx).toFixed(1)} ${pts[i].toFixed(1)}`;
  return d + ` L ${W + 100} ${H + 50} Z`;
}

const PALETTES = {
  // Aube : lointains bleutés qui s'assombrissent vers le premier plan.
  dawn: {
    layers: [
      { seed: 11, y: 640, amp: 320, rough: 0.6, fill: "#BCC4CA", speed: 0.05 },
      { seed: 23, y: 690, amp: 260, rough: 0.6, fill: "#99A4AC", speed: 0.1 },
      { seed: 37, y: 750, amp: 200, rough: 0.6, fill: "#6E7B83", speed: 0.16 },
      { seed: 41, y: 815, amp: 150, rough: 0.6, fill: "#3E484E", speed: 0.24 },
      { seed: 53, y: 880, amp: 110, rough: 0.62, fill: "#1F2326", speed: 0.32 },
    ],
    fog: "#EDEFF0",
  },
  // Crépuscule pour la section contact.
  dusk: {
    layers: [
      { seed: 101, y: 600, amp: 240, rough: 0.52, fill: "#4E4A55", speed: 0.04 },
      { seed: 113, y: 660, amp: 190, rough: 0.55, fill: "#383943", speed: 0.08 },
      { seed: 127, y: 740, amp: 160, rough: 0.57, fill: "#262930", speed: 0.13 },
      { seed: 131, y: 830, amp: 120, rough: 0.6, fill: "#16191D", speed: 0.2 },
    ],
    fog: "#8E7A68",
  },
};

function buildRange(svg) {
  const palette = PALETTES[svg.dataset.range];
  if (!palette) return [];
  const id = svg.dataset.range;

  const defs = document.createElementNS(SVG_NS, "defs");
  defs.innerHTML = `
    <linearGradient id="fog-${id}" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="${palette.fog}" stop-opacity="0"/>
      <stop offset="0.55" stop-color="${palette.fog}" stop-opacity="0.55"/>
      <stop offset="1" stop-color="${palette.fog}" stop-opacity="0"/>
    </linearGradient>`;
  svg.appendChild(defs);

  const groups = [];
  palette.layers.forEach((layer, i) => {
    const g = document.createElementNS(SVG_NS, "g");
    const path = document.createElementNS(SVG_NS, "path");
    path.setAttribute("d", ridgePath(ridgePoints(layer.seed, layer.y, layer.amp, layer.rough)));
    path.setAttribute("fill", layer.fill);
    g.appendChild(path);

    // Banc de brume au pied de chaque crête (sauf la dernière).
    if (i < palette.layers.length - 1) {
      const fog = document.createElementNS(SVG_NS, "rect");
      fog.setAttribute("x", -100);
      fog.setAttribute("width", W + 200);
      fog.setAttribute("y", layer.y - 20);
      fog.setAttribute("height", 140);
      fog.setAttribute("fill", `url(#fog-${id})`);
      g.appendChild(fog);
    }
    svg.appendChild(g);
    groups.push({ g, speed: layer.speed });
  });
  return groups;
}

const ranges = [...document.querySelectorAll(".range")].map((svg) => ({
  section: svg.parentElement,
  groups: buildRange(svg),
}));

// Parallaxe : chaque couche glisse un peu, selon sa distance.
function parallax() {
  const vh = window.innerHeight;
  for (const { section, groups } of ranges) {
    const r = section.getBoundingClientRect();
    if (r.bottom < 0 || r.top > vh) continue;
    const progress = -r.top; // px défilés depuis le haut de la section
    for (const { g, speed } of groups) {
      g.style.transform = `translate3d(0, ${(progress * speed).toFixed(1)}px, 0)`;
    }
  }
}

// Nav : fond au scroll, texte clair sur la section contact.
const nav = document.getElementById("nav");
const contact = document.getElementById("contact");
function updateNav() {
  nav.classList.toggle("is-scrolled", window.scrollY > 24);
  const c = contact.getBoundingClientRect();
  nav.classList.toggle("is-dark", c.top <= nav.offsetHeight + 80 && c.bottom > 0);
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
