/****************************************
 *  script.js – CAROUSEL + SENTINELLE   *
 ****************************************/

/* ---------- CAROUSEL ---------- */
const host = document.getElementById("grid");

// On suppose que projects[] est défini dans projects.js
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
  // génère les slides
  const slidesHTML = list.map(p => `
    <div class="slide">
      <img src="${p.cover}" alt="">
      <h2>${p.title}</h2>
      <p>${p.tagline}</p>
      ${p.date ? `<small>Dernier commit : ${p.date}</small>` : ""}
      <a href="https://github.com/${p.repo}" target="_blank">Voir le repo</a>
    </div>
  `).join("");

  // insère le carrousel
  host.innerHTML = `
    <div class="carousel">
      <button id="prev" class="nav-btn">&#10094;</button>
      <div id="slides">${slidesHTML}</div>
      <button id="next" class="nav-btn">&#10095;</button>
    </div>
  `;

  // logique de défilement
  const slides = document.querySelectorAll(".slide");
  let idx = 0;
  const total = slides.length;
  const container = document.getElementById("slides");
  function show(i){
    container.style.transform = `translateX(-${i*100}%)`;
    idx = i;
  }
  document.getElementById("next").onclick = () => show((idx+1)%total);
  document.getElementById("prev").onclick = () => show((idx-1+total)%total);
  show(0);
  setInterval(()=> document.getElementById("next").click(), 7000);
});

/* ---------- SENTINELLE ---------- */
(() => {
  let lastPos = { x: window.innerWidth/2, y: window.innerHeight/2 };
  let idleTimer = null;
  let shootInterval = null;

  function shoot() {
    const proj = document.createElement("div");
    proj.dataset.sentinel = "true";
    // style inline pour un gros carré rouge
    Object.assign(proj.style, {
      position: "fixed",
      width:    "30px",
      height:   "30px",
      backgroundColor: "red",
      left:     `${lastPos.x - 15}px`,
      top:      `${lastPos.y - 15}px`,
      pointerEvents: "none"
    });
    document.body.appendChild(proj);
  }

  function resetIdle() {
    clearTimeout(idleTimer);
    if (shootInterval) {
      clearInterval(shootInterval);
      shootInterval = null;
    }
    // supprime tous les projectiles
    document.querySelectorAll("div[data-sentinel]").forEach(el => el.remove());

    // après 1s sans mouvement, tire toutes les 1s
    idleTimer = setTimeout(() => {
      shootInterval = setInterval(shoot, 1000);
    }, 1000);
  }

  window.addEventListener("mousemove", e => {
    lastPos = { x: e.clientX, y: e.clientY };
    resetIdle();
  });

  resetIdle();  // démarre le timer dès le chargement
})();
