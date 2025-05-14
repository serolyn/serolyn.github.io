/****************************************
 *        script.js — CAROUSEL          *
 *   SENTINELLE (PC) + IDLE EFFECT      *
 ****************************************/

// 1) CAROUSEL (inchangé)
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
  const slides = list.map(p => `
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
      <div id="slides">${slides}</div>
      <button id="next" class="nav-btn">&#10095;</button>
    </div>
  `;
  const slideEls = document.querySelectorAll(".slide");
  let idx = 0, total = slideEls.length;
  const sc = document.getElementById("slides");
  function show(i){
    sc.style.transform = \`translateX(-\${i*100}%)\`; idx = i;
  }
  document.getElementById("next").onclick = ()=> show((idx+1)%total);
  document.getElementById("prev").onclick = ()=> show((idx-1+total)%total);
  show(0);
  setInterval(()=> document.getElementById("next").click(), 7000);
});

// 2) SENTINELLE & IDLE
(() => {
  const isMobile = window.matchMedia("(pointer: coarse)").matches;
  const sentinel = document.getElementById("sentinel");
  let lastPos = { x: window.innerWidth/2, y: window.innerHeight/2 };
  let idleTimer = null, shootInterval = null;

  // Crée un projectile du sentinel vers lastPos
  function launch() {
    const proj = document.createElement("div");
    proj.className = "projectile";
    document.body.appendChild(proj);
    const r = sentinel.getBoundingClientRect();
    const startX = r.left + r.width/2, startY = r.top + r.height/2;
    proj.style.left = \`\${startX - 10}px\`;
    proj.style.top  = \`\${startY - 10}px\`;
    const dx = lastPos.x - startX, dy = lastPos.y - startY;
    requestAnimationFrame(() => {
      proj.style.transform = \`translate(\${dx}px,\${dy}px)\`;
    });
    setTimeout(() => proj.remove(), 600);
  }

  // Démarre la sentinelle (PC uniquement)
  function startSentinel() {
    if (isMobile) return;
    if (shootInterval) return;
    launch(); // tir immédiat
    shootInterval = setInterval(launch, 1000);
  }

  // Arrête les tirs et supprime les projectiles
  function stopSentinel() {
    clearInterval(shootInterval);
    shootInterval = null;
    document.querySelectorAll(".projectile").forEach(e=>e.remove());
  }

  // Passage en mode idle (>5s)
  function triggerIdle() {
    document.body.classList.add("idle");
    startSentinel();
  }

  // Sortie du mode idle au moindre mouvement / touch
  function clearIdle() {
    document.body.classList.remove("idle");
    stopSentinel();
    clearTimeout(idleTimer);
    idleTimer = setTimeout(triggerIdle, 5000);
  }

  // Écouteur universel pointer (souris + tactile)
  window.addEventListener("pointermove", e => {
    lastPos = { x: e.clientX, y: e.clientY };
    clearIdle();
  });
  window.addEventListener("pointerdown", e => {
    lastPos = { x: e.clientX, y: e.clientY };
    clearIdle();
  });

  // Init
  idleTimer = setTimeout(triggerIdle, 5000);
})();
