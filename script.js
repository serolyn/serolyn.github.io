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
  function drawLine(x, y) {
    clearLine();
    const NS = "http://www.w3.org/2000/svg";
    const line = document.createElementNS(NS, "line");
    const sx = window.innerWidth  - 20; // départ 20px du bord droit
    const sy = window.innerHeight - 20; // départ 20px du bas
    line.setAttribute("x1", sx);
    line.setAttribute("y1", sy);
    line.setAttribute("x2", x);
    line.setAttribute("y2", y);
    line.setAttribute("stroke", "var(--accent)");
    line.setAttribute("stroke-width", "2");
    svg.appendChild(line);
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
