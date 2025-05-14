/****************************************
 *      script.js — Bootstrap finale    *
 ****************************************/
document.addEventListener("DOMContentLoaded", () => {
  // ── CAROUSEL ────────────────────────
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
    const slidesHTML = list.map(p => `
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
        <div id="slides">${slidesHTML}</div>
        <button id="next" class="nav-btn">&#10095;</button>
      </div>
    `;
    const slides = document.querySelectorAll(".slide");
    let idx = 0, total = slides.length;
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

  // ── SENTINELLE + IDLE ────────────────
  const sentinel = document.getElementById("sentinel");
  const isTouch  = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
  const IDLE_MS  = 45000;
  let lastPos    = { x: window.innerWidth/2, y: window.innerHeight/2 };
  let idleTimer, shootTimer;

  function fire() {
    const proj = document.createElement("div");
    proj.className = "projectile";
    document.body.appendChild(proj);
    const r = sentinel.getBoundingClientRect();
    const sx = r.left + r.width/2, sy = r.top + r.height/2;
    proj.style.left = `${sx - 15}px`;
    proj.style.top  = `${sy - 15}px`;
    const dx = lastPos.x - sx, dy = lastPos.y - sy;
    requestAnimationFrame(() => {
      proj.style.transform = `translate(${dx}px,${dy}px)`;
    });
    setTimeout(()=> proj.remove(), 600);
  }

  function startSentinel() {
    if (isTouch || shootTimer) return;
    fire();
    shootTimer = setInterval(fire, 1000);
  }
  function stopSentinel() {
    clearInterval(shootTimer);
    shootTimer = null;
    document.querySelectorAll(".projectile").forEach(e => e.remove());
  }

  function enterIdle() {
    document.body.classList.add("idle");
    startSentinel();
  }
  function resetIdle(e) {
    if (e.touches && e.touches[0]) {
      lastPos = { x: e.touches[0].clientX, y: e.touches[0].clientY };
    } else {
      lastPos = { x: e.clientX, y: e.clientY };
    }
    document.body.classList.remove("idle");
    stopSentinel();
    clearTimeout(idleTimer);
    idleTimer = setTimeout(enterIdle, IDLE_MS);
  }

  window.addEventListener("mousemove", resetIdle,  { passive: true });
  window.addEventListener("touchstart", resetIdle,  { passive: true });

  idleTimer = setTimeout(enterIdle, IDLE_MS);
});
