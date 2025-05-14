/****************************************
 *        script.js — CAROUSEL          *
 *    + SENTINELLE + PROJECTILES        *
 ****************************************/

// 1) CAROUSEL
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

  // slider logic
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

// 2) SENTINELLE + PROJECTILES
(() => {
  const sentinel = document.getElementById("sentinel");
  let lastPos = { x: window.innerWidth/2, y: window.innerHeight/2 };
  let idleTimer = null;
  let shootInterval = null;

  // Crée et lance un projectile depuis le sentinel vers lastPos
  function launchProjectile() {
    const proj = document.createElement("div");
    proj.className = "projectile";
    document.body.appendChild(proj);

    // Position de départ = centre du sentinel
    const rect = sentinel.getBoundingClientRect();
    const startX = rect.left + rect.width/2;
    const startY = rect.top  + rect.height/2;
    proj.style.left = `${startX - 10}px`;
    proj.style.top  = `${startY - 10}px`;

    // Calcule vecteur
    const dx = lastPos.x - startX;
    const dy = lastPos.y - startY;
    // Déclenche la transition
    requestAnimationFrame(() => {
      proj.style.transform = `translate(${dx}px, ${dy}px)`;
    });
    // Supprime après le temps de transition + petit délai
    setTimeout(() => proj.remove(), 600);
  }

  function resetIdle() {
    clearTimeout(idleTimer);
    if (shootInterval) {
      clearInterval(shootInterval);
      shootInterval = null;
    }
    // suppression immédiate de tous les projectiles existants
    document.querySelectorAll(".projectile").forEach(el=>el.remove());
    // Après 1s sans bouger, tire toutes les 1s
    idleTimer = setTimeout(() => {
      launchProjectile();         // premier tir
      shootInterval = setInterval(launchProjectile, 1000);
    }, 1000);
  }

  // Écoute le mouvement souris
  window.addEventListener("mousemove", e => {
    lastPos = { x: e.clientX, y: e.clientY };
    resetIdle();
  });

  // Lance le timer dès le chargement
  resetIdle();
})();
