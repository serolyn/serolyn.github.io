/****************************************
 *        script.js — VERSION FINALE     *
 *    Carousel + Idle + Line Tracking   *
 ****************************************/
document.addEventListener("DOMContentLoaded", () => {
  // ── CAROUSEL ─────────────────────────
  const host = document.getElementById("grid");
  Promise.all(
    projects.map(p =>
      fetch(`https://api.github.com/repos/${p.repo}`)
        .then(r => r.ok ? r.json() : null)
        .then(d => ({
          ...p,
          title: d ? d.name.replace(/-/g," ") : p.repo.split("/")[1],
          date:  d ? new Date(d.pushed_at).toLocaleDateString() : ""
        }))
    )
  ).then(list => {
    // Génération HTML des slides
    const html = list.map(p => `
      <div class="slide">
        <img src="${p.cover}" alt="">
        <h2>${p.title}</h2>
        <p>${p.tagline}</p>
        ${p.date ? `<small>Dernier commit : ${p.date}</small>` : ""}
        <a href="https://github.com/${p.repo}" target="_blank">Voir le repo</a>
      </div>
    `).join("");
    host.innerHTML = `
      <div class="carousel">
        <button id="prev" class="nav-btn">&#10094;</button>
        <div id="slides">${html}</div>
        <button id="next" class="nav-btn">&#10095;</button>
      </div>
    `;
    // Logique de navigation
    const slides = document.querySelectorAll(".slide");
    let idx = 0, total = slides.length;
    const container = document.getElementById("slides");
    function show(i) {
      container.style.transform = \`translateX(-\${i*100}%)\`;
      idx = i;
    }
    document.getElementById("next").onclick = ()=> show((idx+1)%total);
    document.getElementById("prev").onclick = ()=> show((idx-1+total)%total);
    show(0);
    setInterval(()=> document.getElementById("next").click(), 7000);
  });

  // ── IDLE + LINE TRACKING ─────────────
  const IDLE_DELAY = 45000;           // 45 secondes
  let idleTimer   = null;
  let tracking    = false;
  let lastPos     = { x:0, y:0 };
  const toggleBtn = document.getElementById("toggle-tracking");
  const svg       = document.getElementById("tracker-svg");

  // Fonction d’entrée en idle
  function goIdle() {
    document.body.classList.add("idle");
  }
  // Fonction de sortie d’idle
  function clearIdle() {
    document.body.classList.remove("idle");
    resetIdleTimer();
  }
  // Réinitialise le timer d’idle
  function resetIdleTimer() {
    clearTimeout(idleTimer);
    idleTimer = setTimeout(goIdle, IDLE_DELAY);
  }

  // Toggle du suivi (PC only)
  toggleBtn.addEventListener("click", () => {
    tracking = !tracking;
    toggleBtn.textContent = tracking
      ? "Désactiver le suivi"
      : "Activer le suivi (PC uniquement)";
    if (!tracking) {
      // retire la ligne
      svg.innerHTML = "";
    }
  });

  // Sur tout mouvement / touch start
  function onActivity(e) {
    // coords
    const ev = e.touches ? e.touches[0] : e;
    lastPos = { x: ev.clientX, y: ev.clientY };
    // reset idle
    clearIdle();
    // update tracking line si actif et non mobile
    if (tracking && !window.matchMedia("(pointer: coarse)").matches) {
      drawLine(lastPos.x, lastPos.y);
    }
  }

  // Dessine une ligne du coin bas-droite vers (x,y)
  function drawLine(x, y) {
    const width  = window.innerWidth;
    const height = window.innerHeight;
    const sx = width - 20; // 20px du bord droit
    const sy = height - 20; // 20px du bas
    // crée / remplace une seule ligne
    let line = svg.querySelector("line");
    if (!line) {
      line = document.createElementNS("http://www.w3.org/2000/svg","line");
      line.setAttribute("stroke", "var(--accent)");
      line.setAttribute("stroke-width", "2");
      svg.appendChild(line);
    }
    // set coords
    line.setAttribute("x1", sx);
    line.setAttribute("y1", sy);
    line.setAttribute("x2", x);
    line.setAttribute("y2", y);
  }

  // Listeners pour activity
  window.addEventListener("mousemove", onActivity, { passive: true });
  window.addEventListener("touchstart",  onActivity, { passive: true });

  // initialisation
  resetIdleTimer();
});
