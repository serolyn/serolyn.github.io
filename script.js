/**
 * script.js
 * 1) Carousel de projets
 * 2) Idle (45 s) – UI tombe
 * 3) Toggle + tracking ligne (PC uniquement)
 */
document.addEventListener("DOMContentLoaded", () => {
  // 1) CAROUSEL
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
    host.innerHTML = `
      <div class="carousel">
        <button id="prev" class="nav-btn">&#10094;</button>
        <div id="slides">
          ${list.map(p => `
            <div class="slide">
              <img src="${p.cover}" alt="">
              <h2>${p.title}</h2>
              <p>${p.tagline}</p>
              ${p.date?`<small>Dernier commit : ${p.date}</small>`:""}
              <a href="https://github.com/${p.repo}" target="_blank">Voir le repo</a>
            </div>
          `).join("")}
        </div>
        <button id="next" class="nav-btn">&#10095;</button>
      </div>`;
    const slides = document.querySelectorAll(".slide");
    let idx = 0, total = slides.length;
    const container = document.getElementById("slides");
    function show(i) { container.style.transform = `translateX(-${i*100}%)`; idx = i; }
    document.getElementById("next").onclick = () => show((idx+1)%total);
    document.getElementById("prev").onclick = () => show((idx-1+total)%total);
    show(0);
    setInterval(() => document.getElementById("next").click(), 7000);
  });

  // 2) IDLE
  const IDLE_MS = 45000;
  let idleTimer;
  function goIdle() { document.body.classList.add("idle"); }
  function resetIdle() {
    document.body.classList.remove("idle");
    clearTimeout(idleTimer);
    idleTimer = setTimeout(goIdle, IDLE_MS);
  }
  window.addEventListener("mousemove", resetIdle, {passive:true});
  window.addEventListener("touchstart", resetIdle, {passive:true});
  resetIdle();

  // 3) TOGGLE + TRACKING
  let tracking = false;
  const toggleBtn = document.getElementById("toggle-tracking");
  const svg = document.getElementById("tracker-svg");
  const isMobile = window.matchMedia("(pointer: coarse)").matches;

  // toggle tracking
  toggleBtn.addEventListener("click", () => {
    if (isMobile) return;
    tracking = !tracking;
    toggleBtn.textContent = tracking
      ? "Désactiver le suivi"
      : "Activer le suivi (PC uniquement)";
    if (!tracking) svg.innerHTML = "";
  });

  // on move, draw line if tracking
  window.addEventListener("mousemove", e => {
    if (tracking && !isMobile) {
      svg.innerHTML = "";
      const NS = "http://www.w3.org/2000/svg";
      const line = document.createElementNS(NS, "line");
      const sx = window.innerWidth - 20;
      const sy = window.innerHeight - 20;
      line.setAttribute("x1", sx);
      line.setAttribute("y1", sy);
      line.setAttribute("x2", e.clientX);
      line.setAttribute("y2", e.clientY);
      line.setAttribute("stroke", "var(--accent)");
      line.setAttribute("stroke-width", "2");
      svg.appendChild(line);
    }
  }, {passive:true});
});
