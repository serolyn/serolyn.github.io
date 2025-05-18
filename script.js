/**
 * script.js
 * 1) Carousel de projets (inchangé)
 * 2) Idle (45 s) – UI “tombe”
 * 3) Toggle + onde sinusoïdale de suivi (PC uniquement)
 * 4) Animation Apple : reveal du carousel au scroll
 */
document.addEventListener("DOMContentLoaded", () => {
  // ── 1) CAROUSEL ──────────────────────────────
  const host = document.getElementById("carousel-section");
  Promise.all(
    projects.map(p =>
      fetch(`https://api.github.com/repos/${p.repo}`)
        .then(r => r.ok ? r.json() : null)
        .then(d => ({
          ...p,
          title: d ? d.name.replace(/-/g, " ") : p.repo.split("/")[1],
          date:  d ? new Date(d.pushed_at).toLocaleDateString() : ""
        }))
    )
  ).then(list => {
    host.innerHTML = `
      <button id="prev" class="nav-btn">&#10094;</button>
      <div id="slides">
        ${list.map(p => `
          <div class="slide">
            <img src="${p.cover}" alt="">
            <h2>${p.title}</h2>
            <p>${p.tagline}</p>
            ${p.date ? `<small>Dernier commit : ${p.date}</small>` : ""}
            <a href="https://github.com/${p.repo}" target="_blank">Voir le repo</a>
          </div>
        `).join("")}
      </div>
      <button id="next" class="nav-btn">&#10095;</button>
    `;
    const slides    = document.querySelectorAll(".slide");
    let idx         = 0;
    const total     = slides.length;
    const container = document.getElementById("slides");
    function show(i) {
      container.style.transform = `translateX(-${i*100}%)`;
      idx = i;
    }
    document.getElementById("next").onclick = () => show((idx+1)%total);
    document.getElementById("prev").onclick = () => show((idx-1+total)%total);
    show(0);
    setInterval(()=> document.getElementById("next").click(), 7000);
  });

  // ── 2) IDLE ────────────────────────────────────
  const IDLE_MS = 45000;
  let idleTimer;
  function goIdle() {
    document.body.classList.add("idle");
  }
  function resetIdle() {
    document.body.classList.remove("idle");
    clearTimeout(idleTimer);
    idleTimer = setTimeout(goIdle, IDLE_MS);
  }
  window.addEventListener("mousemove", resetIdle, { passive: true });
  window.addEventListener("touchstart", resetIdle, { passive: true });
  resetIdle();

  // ── 3) TOGGLE + ONDE SINUSOÏDALE ──────────────
  let tracking = false;
  const toggleBtn = document.getElementById("toggle-tracking");
  const svg       = document.getElementById("tracker-svg");
  const isMobile  = window.matchMedia("(pointer: coarse)").matches;

  // Point de départ – 20 px du coin bas-droite
  const origin = {
    x: window.innerWidth  - 20,
    y: window.innerHeight - 20
  };

  // Variables pour le path et les points
  let path = null;
  let points = [];

  // Initialise le <path> SVG et le tableau points[]
  function initWave() {
    if (path) return;
    const NS = "http://www.w3.org/2000/svg";
    path = document.createElementNS(NS, "path");
    path.setAttribute("fill", "none");
    path.setAttribute("stroke", "var(--accent)");
    path.setAttribute("stroke-width", "2");
    svg.appendChild(path);
    // Commencer la sinusoïde à l’origine
    points = [{ x: origin.x, y: origin.y }];
  }

  // Étend l’onde vers (tx, ty) en ajoutant des points sinusoïdaux
  function extendWave(tx, ty) {
    initWave();
    const last = points[points.length - 1];
    const dx   = tx - last.x;
    const dy   = ty - last.y;
    const SEGMENTS = 10;    // nb de sous-points ajoutés à chaque move
    const AMP      = 20;    // amplitude de l’onde

    // Génération de points intermédiaires
    for (let i = 1; i <= SEGMENTS; i++) {
      const t  = i / SEGMENTS;
      const xi = last.x + dx * t;
      // Ajouter sinusoïde sur la distance parcourue * fréquence
      const yi = last.y + dy * t + Math.sin((points.length + i) * 0.3) * AMP;
      points.push({ x: xi, y: yi });
    }

    // Reconstruit l’attribut d="..." du <path>
    let d = `M ${points[0].x},${points[0].y}`;
    for (let i = 1; i < points.length; i++) {
      d += ` L ${points[i].x},${points[i].y}`;
    }
    path.setAttribute("d", d);
  }

  // Efface le path et remet points[] à vide
  function clearWave() {
    if (path) {
      path.remove();
      path = null;
      points = [];
    }
  }

  // Gère le clic sur le bouton toggle
  toggleBtn.addEventListener("click", () => {
    if (isMobile) return; // ne fait rien sur mobile
    tracking = !tracking;
    // Change le texte du bouton selon l’état
    toggleBtn.textContent = tracking
      ? "Désactiver le suivi"
      : "Activer le suivi (PC uniquement)";
    if (!tracking) clearWave(); // supprime l’onde si on désactive
  });

  // Sur mouvement de la souris, étend l’onde si tracking activé
  window.addEventListener("mousemove", e => {
    if (tracking && !isMobile) {
      extendWave(e.clientX, e.clientY);
    }
  }, { passive: true });

  // Sur touchstart (ne dessine pas mais reset idle)
  window.addEventListener("touchstart", resetIdle, { passive: true });
});

// ── 4) ANIMATION APPLE REVEAL DU CARROUSEL ──────
document.addEventListener('DOMContentLoaded', function () {
  const reveal = document.querySelector('.carousel-reveal');
  if (!reveal) return;

  function handleScroll() {
    const rect = reveal.getBoundingClientRect();
    if (rect.top < window.innerHeight - 120) {
      reveal.classList.add('visible');
      window.removeEventListener('scroll', handleScroll);
    }
  }
  window.addEventListener('scroll', handleScroll);
  handleScroll(); // si déjà visible au load
});
// Scroll reveal individuel sur chaque skill
document.addEventListener('DOMContentLoaded', () => {
  const skills = document.querySelectorAll('.skill');
  function revealSkills() {
    const triggerBottom = window.innerHeight * 0.92;
    skills.forEach((skill, i) => {
      const rect = skill.getBoundingClientRect();
      if (rect.top < triggerBottom) {
        // Effet cascade : délai selon l’index
        setTimeout(() => skill.classList.add('visible'), i * 110);
      }
    });
  }
  window.addEventListener('scroll', revealSkills);
  revealSkills();
});

