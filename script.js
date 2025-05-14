/* script.js
 *
 * 1. Construction du carousel de projets
 * 2. Gestion de l’idle (45 s)
 * 3. Toggle “ligne de suivi” (PC uniquement)
 */

document.addEventListener("DOMContentLoaded", () => {
  // ── CAROUSEL ─────────────────────────
  const host = document.getElementById("grid");
  Promise.all(
    projects.map(p =>
      fetch(`https://api.github.com/repos/${p.repo}`)
        .then(r => r.ok ? r.json() : null)
        .then(d => ({
          ...p,
          // titre découplé du slug
          title: d ? d.name.replace(/-/g, " ") : p.repo.split("/")[1],
          // date du dernier push
          date:  d ? new Date(d.pushed_at).toLocaleDateString() : ""
        }))
    )
  ).then(list => {
    // Générer les slides
    const slidesHTML = list.map(p => `
      <div class="slide">
        <img src="${p.cover}" alt="Cover">
        <h2>${p.title}</h2>
        <p>${p.tagline}</p>
        ${p.date ? `<small>Dernier commit : ${p.date}</small>` : ""}
        <a href="https://github.com/${p.repo}" target="_blank">Voir le repo</a>
      </div>
    `).join("");
    // Injecter le carousel
    host.innerHTML = `
      <div class="carousel">
        <button id="prev" class="nav-btn">&#10094;</button>
        <div id="slides">${slidesHTML}</div>
        <button id="next" class="nav-btn">&#10095;</button>
      </div>
    `;
    // Logique de navigation
    const slides = document.querySelectorAll(".slide");
    let idx = 0, total = slides.length;
    const container = document.getElementById("slides");
    function show(i) {
      container.style.transform = `translateX(-${i * 100}%)`;
      idx = i;
    }
    document.getElementById("next").onclick = () => show((idx + 1) % total);
    document.getElementById("prev").onclick = () => show((idx - 1 + total) % total);
    show(0);
    setInterval(() => document.getElementById("next").click(), 7000);
  });

  // ── IDLE + LINE TRACKING ─────────────
  const IDLE_DELAY = 45000; // 45 s
  let idleTimer    = null;
  let tracking     = false;
  const toggleBtn  = document.getElementById("toggle-tracking");
  const svg        = document.getElementById("tracker-svg");
  const isMobile   = window.matchMedia("(pointer: coarse)").matches;

  // Met la page en idle (après 45s)
  function goIdle() {
    document.body.classList.add("idle");
  }
  // Réinitialise l'état idle
  function resetIdle() {
    document.body.classList.remove("idle");
    clearTimeout(idleTimer);
    idleTimer = setTimeout(goIdle, IDLE_DELAY);
  }
  // Supprime la ligne de suivi
  function clearLine() {
    svg.innerHTML = "";
  }
  // Dessine une ligne du coin vers (x,y)
 // remplace clearLine() + drawLine() par :

/** Calcule une sinusoïde entre (sx,sy) et (tx,ty) **/
function drawWave(tx, ty) {
  clearLine();  // vide l'ancien path
  const NS = "http://www.w3.org/2000/svg";
  const sx = window.innerWidth  - 20;
  const sy = window.innerHeight - 20;
  const dx = tx - sx;
  const dy = ty - sy;
  const length = Math.hypot(dx, dy);     // distance
  const angle  = Math.atan2(dy, dx);     // orientation
  const segments = 50;                   // résolution
  const amplitude = 20;                  // hauteur onde
  let d = `M ${sx},${sy}`                // move to start
  for (let i = 1; i <= segments; i++) {
    const t = i / segments;
    const xi = sx + dx * t;
    const yi = sy + dy * t + Math.sin(t * Math.PI * 4) * amplitude;
    d += ` L ${xi},${yi}`;
  }
  // crée le path
  const path = document.createElementNS(NS, "path");
  path.setAttribute("d", d);
  path.setAttribute("stroke", "var(--accent)");
  path.setAttribute("fill", "none");
  path.setAttribute("stroke-width", "2");
  document.getElementById("tracker-svg").appendChild(path);
}


  // Toggle suivi
  toggleBtn.addEventListener("click", () => {
    if (isMobile) return; // no on mobile
    tracking = !tracking;
    toggleBtn.textContent = tracking
      ? "Désactiver le suivi"
      : "Activer le suivi (PC uniquement)";
    if (!tracking) clearLine();
  });

  // Sur déplacement souris/touch...
  function onActivity(e) {
    resetIdle();
    if (tracking && !isMobile) {
      const ev = e.touches ? e.touches[0] : e;
      drawLine(ev.clientX, ev.clientY);
    }
  }
  window.addEventListener("mousemove", onActivity, { passive: true });
  window.addEventListener("touchstart", onActivity, { passive: true });

  // Démarre le timer idle
  resetIdle();
});
