/* script.js
 *
 * 1) Carousel de projets
 * 2) Gestion de l’idle (45 s) – “tombe” de l’UI
 * 3) Toggle + sinusoïde de suivi (PC uniquement)
 */

document.addEventListener("DOMContentLoaded", () => {
  // ── 1) CAROUSEL ──────────────────────────────
  const host = document.getElementById("grid");
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
    // Génère les slides HTML
    const slidesHTML = list.map(p => `
      <div class="slide">
        <img src="${p.cover}" alt="Cover">
        <h2>${p.title}</h2>
        <p>${p.tagline}</p>
        ${p.date ? `<small>Dernier commit : ${p.date}</small>` : ""}
        <a href="https://github.com/${p.repo}" target="_blank">Voir le repo</a>
      </div>
    `).join("");

    // Injecte le carousel dans la page
    host.innerHTML = `
      <div class="carousel">
        <button id="prev" class="nav-btn">&#10094;</button>
        <div id="slides">${slidesHTML}</div>
        <button id="next" class="nav-btn">&#10095;</button>
      </div>
    `;

    // Logique de navigation
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
    setInterval(() => document.getElementById("next").click(), 7000);
  });

  // ── 2) IDLE & 3) TRACKING ─────────────────────
  const IDLE_DELAY = 45000;  // ms
  let idleTimer    = null;
  let tracking     = false;
  const toggleBtn  = document.getElementById("toggle-tracking");
  const svg        = document.getElementById("tracker-svg");
  const isMobile   = window.matchMedia("(pointer: coarse)").matches;

  /** Passe la page en mode idle (UI “tombe”) */
  function goIdle() {
    document.body.classList.add("idle");
  }

  /** Réinitialise l’état idle et remet le timer */
  function resetIdle() {
    document.body.classList.remove("idle");
    clearTimeout(idleTimer);
    idleTimer = setTimeout(goIdle, IDLE_DELAY);
  }

  /** Supprime toute sinusoïde dessinée */
  function clearWave() {
    svg.innerHTML = "";
  }

  /**
   * Dessine une sinusoïde <path> entre le coin bas-droite (20px du bord)
   * et le point (tx,ty).
   */
  function drawWave(tx, ty) {
    clearWave();
    const NS = "http://www.w3.org/2000/svg";
    // Point de départ
    const sx = window.innerWidth  - 20;
    const sy = window.innerHeight - 20;
    const dx = tx - sx;
    const dy = ty - sy;
    const segments  = 50;
    const amplitude = 20;

    // Construction du d attrib
    let d = `M ${sx},${sy}`;
    for (let i = 1; i <= segments; i++) {
      const t   = i/segments;
      const xi  = sx + dx * t;
      const yi  = sy + dy * t + Math.sin(t * Math.PI * 4) * amplitude;
      d += ` L ${xi},${yi}`;
    }

    // Crée et ajoute le <path>
    const path = document.createElementNS(NS, "path");
    path.setAttribute("d", d);
    path.setAttribute("fill", "none");
    path.setAttribute("stroke", "var(--accent)");
    path.setAttribute("stroke-width", "2");
    svg.appendChild(path);
  }

  // Toggle du suivi
  toggleBtn.addEventListener("click", () => {
    if (isMobile) return;
    tracking = !tracking;
    toggleBtn.textContent = tracking
      ? "Désactiver le suivi"
      : "Activer le suivi (PC uniquement)";
    if (!tracking) clearWave();
  });

  // Gestion d’interaction utilisateur
  function onActivity(e) {
    resetIdle();
    if (tracking && !isMobile) {
      const ev = e.touches ? e.touches[0] : e;
      drawWave(ev.clientX, ev.clientY);
    }
  }
  window.addEventListener("mousemove", onActivity, { passive: true });
  window.addEventListener("touchstart", onActivity, { passive: true });

  // Démarrage du timer idle au chargement
  resetIdle();
});
