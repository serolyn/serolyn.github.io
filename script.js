/****************************************
 *        script.js — VERSION FINALE    *
 ****************************************/

// --- CAROUSEL ---
const host = document.getElementById("grid");
Promise.all(
  projects.map(p =>
    fetch(`https://api.github.com/repos/${p.repo}`)
      .then(r => r.ok ? r.json() : null)
      .then(d => ({
        ...p,
        title:  d ? d.name.replace(/-/g, " ") : p.repo.split("/")[1],
        date:   d ? new Date(d.pushed_at).toLocaleDateString() : ""
      }))
  )
).then(list => {
  // Génère les slides
  const html = list.map(p => `
    <div class="slide">
      <img src="${p.cover}" alt="">
      <h2>${p.title}</h2>
      <p>${p.tagline}</p>
      ${p.date ? `<small>Dernier commit : ${p.date}</small>` : ""}
      <a href="https://github.com/${p.repo}" target="_blank">Voir le repo</a>
    </div>
  `).join("");
  // Injecte le carousel
  host.innerHTML = `
    <div class="carousel">
      <button id="prev" class="nav-btn">&#10094;</button>
      <div id="slides">${html}</div>
      <button id="next" class="nav-btn">&#10095;</button>
    </div>
  `;
  // Logique de défilement
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

// --- SENTINELLE + EFFET IDLE ---
(() => {
  const sentinel   = document.getElementById("sentinel");
  const isTouch    = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
  let lastPos      = { x: window.innerWidth/2, y: window.innerHeight/2 };
  let idleTimer    = null;
  let shootInterval= null;

  // Lance un projectile depuis le sentinel vers lastPos
  function fire() {
    const proj = document.createElement("div");
    proj.className = "projectile";
    document.body.appendChild(proj);
    const rect = sentinel.getBoundingClientRect();
    const sx = rect.left + rect.width/2;
    const sy = rect.top  + rect.height/2;
    proj.style.left = `${sx - 15}px`;
    proj.style.top  = `${sy - 15}px`;
    const dx = lastPos.x - sx;
    const dy = lastPos.y - sy;
    requestAnimationFrame(() => {
      proj.style.transform = `translate(${dx}px, ${dy}px)`;
    });
    setTimeout(() => proj.remove(), 600);
  }

  function startSentinel() {
    if (isTouch || shootInterval) return;
    fire();
    shootInterval = setInterval(fire, 1000);
  }
  function stopSentinel() {
    clearInterval(shootInterval);
    shootInterval = null;
    document.querySelectorAll(".projectile").forEach(e => e.remove());
  }

  // Passe en mode idle (après 5s d'inactivité)
  function goIdle() {
    document.body.classList.add("idle");
    startSentinel();
  }
  // Sort du mode idle au moindre input
  function resetIdle() {
    document.body.classList.remove("idle");
    stopSentinel();
    clearTimeout(idleTimer);
    idleTimer = setTimeout(goIdle, 5000);
  }

  // Met à jour lastPos et resetIdle sur tout mouvement ou touche
  function onInput(e) {
    if (e.touches) {
      lastPos = { x: e.touches[0].clientX, y: e.touches[0].clientY };
    } else {
      lastPos = { x: e.clientX, y: e.clientY };
    }
    resetIdle();
  }

  window.addEventListener("mousemove", onInput);
  window.addEventListener("touchstart", onInput);

  // Démarrage du timer au chargement
  idleTimer = setTimeout(goIdle, 5000);
})();
